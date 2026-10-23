import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatTL } from "@/lib/packages";
import { requireAdmin } from "@/lib/session";
import { Decision } from "./decision";

export const metadata: Metadata = { title: "İptal talepleri", robots: { index: false } };

export default function IptalPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const rows = await db
    .select({ sub: schema.subscriptions, company: schema.companies, pkg: schema.packages })
    .from(schema.subscriptions)
    .innerJoin(schema.companies, eq(schema.companies.id, schema.subscriptions.companyId))
    .innerJoin(schema.packages, eq(schema.packages.id, schema.subscriptions.packageId))
    .where(eq(schema.subscriptions.status, "cancel_requested"))
    .orderBy(asc(schema.subscriptions.updatedAt));

  const items = await Promise.all(
    rows.map(async (r) => {
      const [ticket] = await db
        .select()
        .from(schema.tickets)
        .where(and(eq(schema.tickets.companyId, r.company.id), eq(schema.tickets.category, "iptal")))
        .orderBy(desc(schema.tickets.createdAt))
        .limit(1);
      const [first] = ticket
        ? await db.select().from(schema.ticketMessages).where(eq(schema.ticketMessages.ticketId, ticket.id)).orderBy(asc(schema.ticketMessages.createdAt)).limit(1)
        : [];
      const paid = await db
        .select({ id: schema.payments.id })
        .from(schema.payments)
        .where(and(eq(schema.payments.subscriptionId, r.sub.id), eq(schema.payments.status, "success")));
      return { ...r, ticket, reason: first?.message ?? null, paidCount: paid.length };
    }),
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">İptal talepleri</h1>
      <p className="mt-4 max-w-xl text-soluk">Onaylanana kadar müşterinin hizmeti ve aylık çekimi sürer. Alan adı müşteride kalır.</p>
      {items.length === 0 ? (
        <p className="mt-10 text-xl">Bekleyen iptal talebi yok.</p>
      ) : (
        <ul className="mt-10 space-y-8">
          {items.map(({ sub, company, pkg, ticket, reason, paidCount }) => (
            <li key={sub.id} className="grid gap-8 border-4 border-murekkep bg-beyaz p-6 md:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="ui text-xl">
                  <Link href={`/yonetim/musteriler/${company.id}`} className="underline underline-offset-4">{company.legalName}</Link>
                </h2>
                <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  <div><dt className="ui">Paket</dt><dd>{pkg.name} ({formatTL(pkg.monthlyPriceKurus)})</dd></div>
                  <div><dt className="ui">Başlangıç</dt><dd>{sub.startedAt ? formatDate(sub.startedAt) : "-"}</dd></div>
                  <div><dt className="ui">Taahhüt bitişi</dt><dd>{sub.commitmentEndsAt ? formatDate(sub.commitmentEndsAt) : "-"}</dd></div>
                  <div><dt className="ui">Alınan ödeme</dt><dd>{paidCount} ay</dd></div>
                </dl>
                <h3 className="ui mt-6">Müşterinin nedeni</h3>
                <p className="mt-1 whitespace-pre-wrap">{reason ?? "[Neden bulunamadı]"}</p>
                {ticket ? (
                  <p className="mt-3">
                    <Link href={`/yonetim/destek/${ticket.id}`} className="underline underline-offset-4">Talebe git</Link>
                  </p>
                ) : null}
              </div>
              <Decision subId={sub.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
