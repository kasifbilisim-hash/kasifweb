"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { IyzicoApiError, IyzicoConfigError } from "@/lib/iyzico/client";
import { cancelSubscription, getSubscription } from "@/lib/iyzico/subscription";
import { notify } from "@/lib/notify";
import { requireAdmin } from "@/lib/session";
import { reasonSchema } from "@/lib/validation/admin";

export type CancelDecisionState = { ok?: boolean; message?: string; error?: string; reason?: string };

/** Müşteriye görünen kapanış mesajını iptal talebine yazıp talebi kapatır. */
async function closeCancelTickets(companyId: string, adminId: string, message: string) {
  const open = await db
    .select({ id: schema.tickets.id })
    .from(schema.tickets)
    .where(and(eq(schema.tickets.companyId, companyId), eq(schema.tickets.category, "iptal"), inArray(schema.tickets.status, ["acik", "yanit_bekliyor", "cevaplandi"])));
  for (const t of open) {
    await db.insert(schema.ticketMessages).values({ ticketId: t.id, authorUserId: adminId, message });
    await db.update(schema.tickets).set({ status: "kapandi" }).where(eq(schema.tickets.id, t.id));
  }
}

/**
 * İptali onayla: iyzico aboneliğini iptal eder, abonelik "cancelled", proje "sonlandirildi".
 * Geri alınamaz. Sıra: önce iyzico (dış sistem), sonra veritabanı. Araya hata girerse yeniden denenebilir:
 * iyzico'da zaten iptal edilmişse sorgulanıp devam edilir.
 */
export async function approveCancellation(subId: string, _prev: CancelDecisionState, formData: FormData): Promise<CancelDecisionState> {
  const admin = await requireAdmin();
  if (formData.get("confirm") !== "on") return { error: "Geri alınamaz olduğunu onaylayın." };

  const [sub] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, subId));
  if (!sub || sub.status !== "cancel_requested") return { message: "Bu abonelik artık iptal talebi beklemiyor, sayfayı yenileyin." };

  if (sub.iyzicoSubscriptionRef) {
    try {
      await cancelSubscription(sub.iyzicoSubscriptionRef);
    } catch (err) {
      if (err instanceof IyzicoConfigError) {
        return { message: "iyzico yapılandırılmadı (IYZICO_API_KEY / IYZICO_SECRET_KEY). Abonelik iptal edilmedi." };
      }
      // Daha önce iptal edilmiş olabilir (önceki deneme veritabanına yazamadan kesilmiş).
      const already = await getSubscription(sub.iyzicoSubscriptionRef).then((d) => d.subscriptionStatus === "CANCELED").catch(() => false);
      if (!already) {
        console.error("[cancel] iyzico iptal hatası", err instanceof IyzicoApiError ? err.errorCode : "", err);
        return { message: "iyzico aboneliği iptal edemedi, abonelik olduğu gibi duruyor. Biraz sonra tekrar deneyin." };
      }
    }
  }

  const moved = await db
    .update(schema.subscriptions)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(eq(schema.subscriptions.id, sub.id), eq(schema.subscriptions.status, "cancel_requested")))
    .returning({ id: schema.subscriptions.id });
  if (moved.length === 0) return { message: "Abonelik başka bir işlemle değişti, sayfayı yenileyin." };

  await writeAudit({
    actorUserId: admin.id,
    action: "subscription.cancel_approved",
    targetTable: "subscriptions",
    targetId: sub.id,
    details: { from: "cancel_requested", to: "cancelled", iyzicoSubscriptionRef: sub.iyzicoSubscriptionRef },
  });

  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.companyId, sub.companyId)).orderBy(desc(schema.projects.createdAt)).limit(1);
  if (project && project.stage !== "sonlandirildi") {
    await db.update(schema.projects).set({ stage: "sonlandirildi" }).where(eq(schema.projects.id, project.id));
    await db.insert(schema.projectEvents).values({
      projectId: project.id,
      stage: "sonlandirildi",
      description: "Aboneliğiniz iptal edildi, hizmetler sona erdi. Alan adınız sizde kalır.",
    });
    await writeAudit({
      actorUserId: admin.id,
      action: "project.stage_changed",
      targetTable: "projects",
      targetId: project.id,
      details: { from: project.stage, to: "sonlandirildi" },
    });
  }

  await closeCancelTickets(sub.companyId, admin.id, "İptal talebiniz onaylandı. Aboneliğiniz iptal edildi ve hizmetlerimiz sona erdi. Alan adınız sizde kalır.");
  await notify({ to: "customer", template: "cancel_approved", subjectRef: sub.id });

  revalidatePath("/yonetim/iptal");
  revalidatePath("/yonetim");
  revalidatePath(`/yonetim/musteriler/${sub.companyId}`);
  return { ok: true, message: "Abonelik iptal edildi." };
}

/** İptal talebini reddet: abonelik eski durumuna döner (son ödeme başarısızsa payment_failed). Neden müşteriye gider. */
export async function rejectCancellation(subId: string, _prev: CancelDecisionState, formData: FormData): Promise<CancelDecisionState> {
  const admin = await requireAdmin();
  const raw = String(formData.get("reason") ?? "");
  const parsed = reasonSchema.safeParse({ reason: raw });
  if (!parsed.success) return { error: parsed.error.issues[0].message, reason: raw };

  const [sub] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, subId));
  if (!sub || sub.status !== "cancel_requested") return { message: "Bu abonelik artık iptal talebi beklemiyor, sayfayı yenileyin." };

  const [last] = await db.select({ status: schema.payments.status }).from(schema.payments).where(eq(schema.payments.subscriptionId, sub.id)).orderBy(desc(schema.payments.createdAt)).limit(1);
  const back = last?.status === "failed" ? "payment_failed" : "active";

  const moved = await db
    .update(schema.subscriptions)
    .set({ status: back })
    .where(and(eq(schema.subscriptions.id, sub.id), eq(schema.subscriptions.status, "cancel_requested")))
    .returning({ id: schema.subscriptions.id });
  if (moved.length === 0) return { message: "Abonelik başka bir işlemle değişti, sayfayı yenileyin." };

  await writeAudit({
    actorUserId: admin.id,
    action: "subscription.cancel_rejected",
    targetTable: "subscriptions",
    targetId: sub.id,
    details: { from: "cancel_requested", to: back, reason: parsed.data.reason },
  });
  await closeCancelTickets(sub.companyId, admin.id, `İptal talebiniz kabul edilmedi. ${parsed.data.reason}`);
  await notify({ to: "customer", template: "cancel_rejected", subjectRef: sub.id, data: { reason: parsed.data.reason } });

  revalidatePath("/yonetim/iptal");
  revalidatePath("/yonetim");
  revalidatePath(`/yonetim/musteriler/${sub.companyId}`);
  return { ok: true, message: "Talep reddedildi, abonelik devam ediyor." };
}
