"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { checkStageChange } from "@/lib/stage-rules";
import { requireAdmin } from "@/lib/session";
import { removeFile } from "@/lib/storage";
import { storeUpload } from "@/lib/uploads";
import { stageChangeSchema } from "@/lib/validation/admin";

export type StageState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  version?: number;
};

const DEFAULT_TEXT: Record<string, string> = {
  bilgi_bekleniyor: "Bilgileriniz bekleniyor.",
  taahhutname_bekleniyor: "Taahhütnameniz bekleniyor.",
  tasarim: "Tasarım aşamasına geçtik.",
  musteri_onayi: "Tasarım hazır, onayınızı bekliyoruz. Önizlemeyi panelden açabilirsiniz.",
  gelistirme: "Geliştirme aşamasına geçtik.",
  yayinda: "Siteniz yayında.",
};

/** Proje aşamasını, müşteriye görünen notu ve önizleme adresini günceller. */
export async function changeProjectStage(companyId: string, _prev: StageState, formData: FormData): Promise<StageState> {
  const admin = await requireAdmin();
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.companyId, companyId)).orderBy(desc(schema.projects.createdAt)).limit(1);
  if (!project) return { message: "Bu firmanın projesi yok (abonelik başlamamış)." };
  if (project.stage === "sonlandirildi") return { message: "Proje sonlandırıldı, aşama değiştirilemez." };

  const parsed = stageChangeSchema.safeParse({
    stage: formData.get("stage"),
    description: String(formData.get("description") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    previewUrl: String(formData.get("previewUrl") ?? ""),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors, version: Date.now() };
  }
  const { stage, description, notes, previewUrl } = parsed.data;

  const [doc] = await db.select({ status: schema.commitmentDocuments.status }).from(schema.commitmentDocuments).where(eq(schema.commitmentDocuments.companyId, companyId)).orderBy(desc(schema.commitmentDocuments.createdAt)).limit(1);
  const rule = checkStageChange({ to: stage, commitmentApproved: doc?.status === "onaylandi", previewUrl });
  if (rule) return { errors: { stage: rule }, version: Date.now() };

  const stageChanged = stage !== project.stage;
  const textChanged = (project.notes ?? "") !== notes || (project.previewUrl ?? null) !== previewUrl;
  if (!stageChanged && !description && !textChanged) return { message: "Değişiklik yok.", version: Date.now() };

  // Koşullu güncelleme: başka biri aynı anda aşamayı değiştirdiyse üzerine yazmayız.
  const updated = await db
    .update(schema.projects)
    .set({ stage, notes: notes || null, previewUrl })
    .where(and(eq(schema.projects.id, project.id), eq(schema.projects.stage, project.stage)))
    .returning({ id: schema.projects.id });
  if (updated.length === 0) return { message: "Proje başka bir işlemle değişti, sayfayı yenileyin.", version: Date.now() };

  if (stageChanged || description) {
    await db.insert(schema.projectEvents).values({
      projectId: project.id,
      stage,
      description: description || DEFAULT_TEXT[stage],
    });
  }
  await writeAudit({
    actorUserId: admin.id,
    action: stageChanged ? "project.stage_changed" : "project.updated",
    targetTable: "projects",
    targetId: project.id,
    details: { from: project.stage, to: stage, notesChanged: (project.notes ?? "") !== notes, previewUrl },
  });
  if (stageChanged) await notify({ to: "customer", template: "project_stage_changed", subjectRef: project.id, data: { stage } });

  revalidatePath(`/yonetim/musteriler/${companyId}`);
  revalidatePath("/panel/proje");
  revalidatePath("/panel");
  return { ok: true, message: "Kaydedildi.", version: Date.now() };
}

export type InvoiceState = { ok?: boolean; message?: string };

/** Ödeme kaydına fatura PDF'i yükler. Dosya firmanın klasörüne yazılır, müşteri panelden indirir. */
export async function uploadInvoice(paymentId: string, _prev: InvoiceState, formData: FormData): Promise<InvoiceState> {
  const admin = await requireAdmin();
  const [row] = await db
    .select({ payment: schema.payments, companyId: schema.subscriptions.companyId })
    .from(schema.payments)
    .innerJoin(schema.subscriptions, eq(schema.subscriptions.id, schema.payments.subscriptionId))
    .where(eq(schema.payments.id, paymentId));
  if (!row) return { message: "Ödeme kaydı bulunamadı." };

  const up = await storeUpload({ companyId: row.companyId, folder: "invoices", file: formData.get("file"), allowed: ["pdf"] });
  if (!up.ok) return { message: up.error };

  await db.update(schema.payments).set({ invoiceUrl: up.file.path }).where(eq(schema.payments.id, paymentId));
  if (row.payment.invoiceUrl) await removeFile(row.payment.invoiceUrl).catch(() => undefined);

  await writeAudit({
    actorUserId: admin.id,
    action: "payment.invoice_uploaded",
    targetTable: "payments",
    targetId: paymentId,
    details: { path: up.file.path, replaced: Boolean(row.payment.invoiceUrl) },
  });
  await notify({ to: "customer", template: "invoice_ready", subjectRef: paymentId });

  revalidatePath(`/yonetim/musteriler/${row.companyId}`);
  revalidatePath("/panel/odemeler");
  return { ok: true, message: "Fatura yüklendi." };
}
