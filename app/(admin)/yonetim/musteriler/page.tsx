import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, ilike, or } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SUB_STATUS } from "@/lib/labels";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Müşteriler", robots: { index: false } };

export default function MusterilerPage({ searchParams }: { searchParams: Promise<{ ara?: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

/** LIKE joker karakterlerini etkisizleştirir. */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

async function Content({ searchParams }: { searchParams: Promise<{ ara?: string }> }) {
  await requireAdmin();
  const { ara } = await searchParams;
  const q = ara?.trim().slice(0, 80);

  const rows = await db
    .select({ company: schema.companies, email: schema.user.email, sub: schema.subscriptions, pkg: schema.packages.name })
    .from(schema.companies)
    .innerJoin(schema.user, eq(schema.user.id, schema.companies.userId))
    .leftJoin(schema.subscriptions, eq(schema.subscriptions.companyId, schema.companies.id))
    .leftJoin(schema.packages, eq(schema.packages.id, schema.subscriptions.packageId))
    .where(q ? or(ilike(schema.companies.legalName, `%${escapeLike(q)}%`), ilike(schema.user.email, `%${escapeLike(q)}%`)) : undefined)
    .orderBy(desc(schema.companies.createdAt))
    .limit(200);

  // Firma başına en yeni abonelik
  const seen = new Set<string>();
  const latest = rows
    .sort((a, b) => (b.sub?.createdAt.getTime() ?? 0) - (a.sub?.createdAt.getTime() ?? 0))
    .filter((r) => (seen.has(r.company.id) ? false : (seen.add(r.company.id), true)));

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Müşteriler</h1>
      <form method="get" className="mt-8 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="ara" className="ui block">Firma ya da e-posta ara</label>
          <input id="ara" name="ara" defaultValue={q ?? ""} className="mt-1 border-2 border-murekkep bg-duvar px-3 py-2" />
        </div>
        <button type="submit" className="ui bg-emaye px-6 py-2 text-beyaz hover:bg-murekkep">Ara</button>
        {q ? <Link href="/yonetim/musteriler" className="underline underline-offset-4">Temizle</Link> : null}
      </form>

      {latest.length === 0 ? (
        <p className="mt-10 text-xl">Müşteri yok.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-y-2 border-murekkep text-left">
            <caption className="sr-only">Müşteriler</caption>
            <thead>
              <tr className="border-b-2 border-murekkep">
                <th scope="col" className="ui py-3 pr-4">Firma</th>
                <th scope="col" className="ui py-3 pr-4">E-posta</th>
                <th scope="col" className="ui py-3 pr-4">Paket</th>
                <th scope="col" className="ui py-3 pr-4">Abonelik</th>
                <th scope="col" className="ui py-3">Başlangıç</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-murekkep">
              {latest.map(({ company, email, sub, pkg }) => (
                <tr key={company.id}>
                  <td className="py-3 pr-4">
                    <Link href={`/yonetim/musteriler/${company.id}`} className="underline underline-offset-4">{company.legalName}</Link>
                  </td>
                  <td className="py-3 pr-4">{email}</td>
                  <td className="py-3 pr-4">{pkg ?? "-"}</td>
                  <td className={`py-3 pr-4 ${sub?.status === "payment_failed" ? "text-red-800" : ""}`}>{sub ? SUB_STATUS[sub.status] : "Abonelik yok"}</td>
                  <td className="py-3">{sub?.startedAt ? formatDate(sub.startedAt) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
