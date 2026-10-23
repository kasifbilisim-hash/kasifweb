"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getPanelData } from "@/lib/panel-data";
import { rateLimit, tooManyMessage } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { cancelSchema, firstErrors } from "@/lib/validation/panel";

export type CancelState = { ok?: boolean; message?: string; errors?: Record<string, string>; reason?: string };

/**
 * İptal talebi: hiçbir şey anında iptal olmaz. Abonelik "cancel_requested" olur, "iptal" kategorisinde
 * bir talep açılır; iyzico aboneliğini yalnızca yönetici onaylayınca (Aşama 7) iptal ederiz.
 */
export async function requestCancellation(_prev: CancelState, formData: FormData): Promise<CancelState> {
  const user = await requireUser();
  const limited = await rateLimit(`cancel:${user.id}`, 5, 3600);
  if (!limited.ok) return { message: tooManyMessage(limited) };
  const data = await getPanelData(user.id);
  const sub = data?.subscription;
  if (!data || !sub) return { message: "İptal edilecek aktif bir abonelik yok." };

  const raw = String(formData.get("reason") ?? "");
  const parsed = cancelSchema.safeParse({ reason: raw });
  if (!parsed.success) return { errors: firstErrors(parsed.error), reason: raw };
  if (formData.get("confirm") !== "on") return { errors: { confirm: "Onay kutusunu işaretleyin." }, reason: raw };

  // Koşullu geçiş: çift tıklama ya da iki sekme tek talep açar.
  const moved = await db
    .update(schema.subscriptions)
    .set({ status: "cancel_requested" })
    .where(and(eq(schema.subscriptions.id, sub.id), inArray(schema.subscriptions.status, ["active", "payment_failed"])))
    .returning({ id: schema.subscriptions.id });
  if (moved.length === 0) return { message: "Bu abonelik için zaten bir iptal talebi var ya da abonelik aktif değil." };

  try {
    const [ticket] = await db
      .insert(schema.tickets)
      .values({ companyId: data.company.id, category: "iptal", priority: "yuksek", subject: "İptal talebi", status: "acik" })
      .returning({ id: schema.tickets.id });
    await db.insert(schema.ticketMessages).values({ ticketId: ticket.id, authorUserId: user.id, message: parsed.data.reason });
    await writeAudit({
      actorUserId: user.id,
      action: "subscription.cancel_requested",
      targetTable: "subscriptions",
      targetId: sub.id,
      details: { from: sub.status, to: "cancel_requested", ticketId: ticket.id },
    });
    await notify({ to: "admin", template: "cancel_requested", subjectRef: ticket.id });
  } catch (error) {
    // Talep açılamadıysa abonelik eski durumuna döner; müşteri tekrar deneyebilir.
    await db.update(schema.subscriptions).set({ status: sub.status }).where(eq(schema.subscriptions.id, sub.id));
    throw error;
  }

  revalidatePath("/panel");
  revalidatePath("/panel/iptal");
  revalidatePath("/panel/destek");
  return { ok: true };
}
