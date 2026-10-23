import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export type Recipient = { email: string; company: string };

/**
 * notify() çağrılarındaki subjectRef farklı tablolardan bir kimliktir (abonelik, talep, proje, ödeme, firma,
 * taahhütname). UUID'ler tablolar arasında çakışmadığı için sırayla denenir.
 */
export async function resolveCustomer(ref: string): Promise<Recipient | null> {
  const companyId = await resolveCompanyId(ref);
  if (!companyId) return null;
  const [row] = await db
    .select({ email: schema.user.email, company: schema.companies.legalName })
    .from(schema.companies)
    .innerJoin(schema.user, eq(schema.user.id, schema.companies.userId))
    .where(eq(schema.companies.id, companyId));
  return row ?? null;
}

async function resolveCompanyId(ref: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(ref)) return null;
  const lookups: Array<() => Promise<string | undefined>> = [
    async () => (await db.select({ id: schema.companies.id }).from(schema.companies).where(eq(schema.companies.id, ref)))[0]?.id,
    async () => (await db.select({ id: schema.subscriptions.companyId }).from(schema.subscriptions).where(eq(schema.subscriptions.id, ref)))[0]?.id,
    async () => (await db.select({ id: schema.tickets.companyId }).from(schema.tickets).where(eq(schema.tickets.id, ref)))[0]?.id,
    async () => (await db.select({ id: schema.projects.companyId }).from(schema.projects).where(eq(schema.projects.id, ref)))[0]?.id,
    async () => (await db.select({ id: schema.commitmentDocuments.companyId }).from(schema.commitmentDocuments).where(eq(schema.commitmentDocuments.id, ref)))[0]?.id,
    async () =>
      (
        await db
          .select({ id: schema.subscriptions.companyId })
          .from(schema.payments)
          .innerJoin(schema.subscriptions, eq(schema.subscriptions.id, schema.payments.subscriptionId))
          .where(eq(schema.payments.id, ref))
      )[0]?.id,
  ];
  for (const find of lookups) {
    const id = await find();
    if (id) return id;
  }
  return null;
}
