"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { maybeAdvanceToDesign } from "@/lib/projects";
import { requireAdmin } from "@/lib/session";
import { reasonSchema } from "@/lib/validation/admin";

export type ReviewState = { ok?: boolean; message?: string; error?: string; reason?: string };

/** Taahhütname onayı/reddi. Yalnızca "yuklendi" durumundaki belge değerlendirilir. */
export async function reviewCommitment(docId: string, _prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const admin = await requireAdmin();
  const approve = formData.get("intent") === "approve";
  const raw = String(formData.get("reason") ?? "");

  let reason: string | null = null;
  if (!approve) {
    const parsed = reasonSchema.safeParse({ reason: raw });
    if (!parsed.success) return { error: parsed.error.issues[0].message, reason: raw };
    reason = parsed.data.reason;
  }

  // Koşullu güncelleme: iki yönetici aynı anda karar verirse yalnızca biri geçer.
  const [doc] = await db
    .update(schema.commitmentDocuments)
    .set({
      status: approve ? "onaylandi" : "reddedildi",
      approvedByAdminId: approve ? admin.id : null,
      rejectionReason: reason,
    })
    .where(and(eq(schema.commitmentDocuments.id, docId), eq(schema.commitmentDocuments.status, "yuklendi")))
    .returning();
  if (!doc) return { message: "Bu belge artık değerlendirilmeyi beklemiyor, sayfayı yenileyin." };

  await writeAudit({
    actorUserId: admin.id,
    action: approve ? "commitment.approved" : "commitment.rejected",
    targetTable: "commitment_documents",
    targetId: doc.id,
    details: { companyId: doc.companyId, ...(reason ? { reason } : {}) },
  });
  await notify({
    to: "customer",
    template: approve ? "commitment_approved" : "commitment_rejected",
    subjectRef: doc.companyId,
    data: reason ? { reason } : undefined,
  });
  if (approve) await maybeAdvanceToDesign(doc.companyId);

  revalidatePath("/yonetim/taahhutnameler");
  revalidatePath("/yonetim");
  revalidatePath(`/yonetim/musteriler/${doc.companyId}`);
  return { ok: true, message: approve ? "Taahhütname onaylandı." : "Taahhütname reddedildi, neden müşteriye gösterilir." };
}
