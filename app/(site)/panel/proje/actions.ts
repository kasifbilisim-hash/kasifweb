"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { firstErrors, revisionSchema } from "@/lib/validation/panel";

export type PreviewState = { ok?: boolean; message?: string; errors?: Record<string, string>; note?: string };

/** Müşteri önizlemeyi onaylar (-> gelistirme) ya da revizyon ister (-> tasarim). Yalnızca "musteri_onayi" aşamasında. */
export async function respondToPreview(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  const user = await requireUser();
  const data = await getPanelData(user.id);
  if (!data?.subscription || !data.project) return { message: "Aktif projeniz yok." };
  const project = data.project;

  const approve = formData.get("intent") === "approve";
  let note = "";
  if (!approve) {
    const parsed = revisionSchema.safeParse({ note: formData.get("note") });
    const raw = String(formData.get("note") ?? "");
    if (!parsed.success) return { errors: firstErrors(parsed.error), note: raw };
    note = parsed.data.note;
  }

  const to = approve ? "gelistirme" : "tasarim";
  // Koşullu güncelleme: çift tıklama ya da başka sekmeden gelen ikinci istek hiçbir şey yapmaz.
  const moved = await db
    .update(schema.projects)
    .set({ stage: to })
    .where(and(eq(schema.projects.id, project.id), eq(schema.projects.stage, "musteri_onayi")))
    .returning({ id: schema.projects.id });
  if (moved.length === 0) return { message: "Proje artık onay aşamasında değil, sayfayı yenileyin." };

  await db.insert(schema.projectEvents).values({
    projectId: project.id,
    stage: to,
    description: approve
      ? "Tasarımı onayladınız. Geliştirmeye geçtik."
      : `Revizyon istediniz: ${note}`,
  });
  await writeAudit({
    actorUserId: user.id,
    action: approve ? "project.preview_approved" : "project.revision_requested",
    targetTable: "projects",
    targetId: project.id,
    details: { from: "musteri_onayi", to, ...(approve ? {} : { note }) },
  });
  await notify({ to: "admin", template: approve ? "preview_approved" : "revision_requested", subjectRef: project.id });

  revalidatePath("/panel/proje");
  revalidatePath("/panel");
  return { ok: true, message: approve ? "Onayınız alındı." : "Revizyon isteğiniz bize ulaştı." };
}
