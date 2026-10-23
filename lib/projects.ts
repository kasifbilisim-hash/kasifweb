import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";

/**
 * Taahhütname onaylandıysa VE başlangıç formu gönderildiyse proje "tasarim" aşamasına geçer.
 * İki olay da (müşteri formu gönderir / yönetici taahhütnameyi onaylar) bunu çağırır; sıra önemsizdir.
 * Zaten ilerlemişse hiçbir şey yapmaz (idempotent).
 */
export async function maybeAdvanceToDesign(companyId: string): Promise<boolean> {
  const [project] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.companyId, companyId))
    .orderBy(desc(schema.projects.createdAt))
    .limit(1);
  if (!project || !["bilgi_bekleniyor", "taahhutname_bekleniyor"].includes(project.stage)) return false;

  const [doc] = await db
    .select({ status: schema.commitmentDocuments.status })
    .from(schema.commitmentDocuments)
    .where(eq(schema.commitmentDocuments.companyId, companyId))
    .orderBy(desc(schema.commitmentDocuments.createdAt))
    .limit(1);
  const [form] = await db
    .select({ status: schema.onboardingForms.status })
    .from(schema.onboardingForms)
    .where(eq(schema.onboardingForms.companyId, companyId));
  if (doc?.status !== "onaylandi" || form?.status !== "gonderildi") return false;

  // Koşullu güncelleme: eşzamanlı iki çağrıdan yalnızca biri geçişi yapar.
  const moved = await db
    .update(schema.projects)
    .set({ stage: "tasarim" })
    .where(
      and(
        eq(schema.projects.id, project.id),
        inArray(schema.projects.stage, ["bilgi_bekleniyor", "taahhutname_bekleniyor"]),
      ),
    )
    .returning({ id: schema.projects.id });
  if (moved.length === 0) return false;

  await db.insert(schema.projectEvents).values({
    projectId: project.id,
    stage: "tasarim",
    description: "Taahhütnameniz onaylandı ve bilgileriniz bize ulaştı. Tasarım aşamasına geçtik.",
  });
  await writeAudit({
    actorUserId: null,
    action: "project.stage_changed",
    targetTable: "projects",
    targetId: project.id,
    details: { from: project.stage, to: "tasarim" },
  });
  await notify({ to: "customer", template: "project_stage_changed", subjectRef: project.id, data: { stage: "tasarim" } });
  return true;
}
