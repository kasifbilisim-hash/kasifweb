"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { rateLimit, tooManyMessage } from "@/lib/rate-limit";
import { removeFile } from "@/lib/storage";
import { storeUpload } from "@/lib/uploads";

export type UploadState = { ok?: boolean; message?: string };

export async function uploadSignedCommitment(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const user = await requireUser();
  const limited = await rateLimit(`commitment-upload:${user.id}`, 20, 3600);
  if (!limited.ok) return { message: tooManyMessage(limited) };
  const data = await getPanelData(user.id);
  if (!data?.subscription || !data.commitment) return { message: "Aktif aboneliğiniz yok." };
  if (data.commitment.status === "onaylandi") return { message: "Taahhütnameniz zaten onaylandı." };
  if (!data.commitment.generatedPdfUrl) return { message: "Önce taahhütnameyi indirin, imzalayıp sonra yükleyin." };

  const result = await storeUpload({
    companyId: data.company.id,
    folder: "taahhutname",
    file: formData.get("file"),
    allowed: ["pdf", "jpg", "png", "webp"],
  });
  if (!result.ok) return { message: result.error };

  const previous = data.commitment.signedUploadUrl;
  await db
    .update(schema.commitmentDocuments)
    .set({ signedUploadUrl: result.file.path, status: "yuklendi", rejectionReason: null })
    .where(eq(schema.commitmentDocuments.id, data.commitment.id));
  if (previous && previous !== result.file.path) await removeFile(previous).catch(() => {});

  await writeAudit({
    actorUserId: user.id,
    action: "commitment.uploaded",
    targetTable: "commitment_documents",
    targetId: data.commitment.id,
    details: { size: result.file.size },
  });
  await notify({ to: "admin", template: "commitment_uploaded", subjectRef: data.commitment.id });

  revalidatePath("/panel/taahhutname");
  revalidatePath("/panel");
  return { ok: true, message: "Dosyanız yüklendi. Yöneticimiz inceleyip onaylayacak." };
}
