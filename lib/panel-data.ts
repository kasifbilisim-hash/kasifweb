import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// Hizmetin sürdüğü abonelik durumları: taahhütname ve başlangıç formu bu durumlarda açılır.
const LIVE = ["active", "payment_failed", "cancel_requested"] as const;

/** Müşterinin firması, güncel aboneliği, paketi, projesi, taahhütnamesi ve başlangıç formu. */
export async function getPanelData(userId: string) {
  const [company] = await db.select().from(schema.companies).where(eq(schema.companies.userId, userId));
  if (!company) return null;

  const [sub] = await db
    .select({ subscription: schema.subscriptions, package: schema.packages })
    .from(schema.subscriptions)
    .innerJoin(schema.packages, eq(schema.packages.id, schema.subscriptions.packageId))
    .where(and(eq(schema.subscriptions.companyId, company.id), inArray(schema.subscriptions.status, [...LIVE])))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1);

  const [project] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.companyId, company.id))
    .orderBy(desc(schema.projects.createdAt))
    .limit(1);
  const [commitment] = await db
    .select()
    .from(schema.commitmentDocuments)
    .where(eq(schema.commitmentDocuments.companyId, company.id))
    .orderBy(desc(schema.commitmentDocuments.createdAt))
    .limit(1);
  const [onboarding] = await db
    .select()
    .from(schema.onboardingForms)
    .where(eq(schema.onboardingForms.companyId, company.id));

  const payments = sub
    ? await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.subscriptionId, sub.subscription.id))
        .orderBy(desc(schema.payments.createdAt))
    : [];

  return {
    company,
    payments,
    subscription: sub?.subscription ?? null,
    package: sub?.package ?? null,
    project: project ?? null,
    commitment: commitment ?? null,
    onboarding: onboarding ?? null,
  };
}

export type PanelData = NonNullable<Awaited<ReturnType<typeof getPanelData>>>;
