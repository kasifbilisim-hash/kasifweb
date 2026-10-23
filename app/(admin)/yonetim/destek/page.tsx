import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { ALL_TICKET_CATEGORIES } from "@/lib/validation/panel";

export const metadata: Metadata = { title: "Destek talepleri", robots: { index: false } };

const STATUS: Record<string, string> = { acik: "Açık", yanit_bekliyor: "Müşteri yazdı", cevaplandi: "Cevaplandı", kapandi: "Kapandı" };
const PRIORITY: Record<string, string> = { dusuk: "Düşük", normal: "Normal", yuksek: "Yüksek" };

type Search = { kategori?: string; durum?: string; oncelik?: string };

export default function DestekPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

function Select({ name, label, options, value }: { name: string; label: string; options: Record<string, string>; value?: string }) {
  return (
    <div>
      <label htmlFor={name} className="ui block">{label}</label>
      <select id={name} name={name} defaultValue={value ?? ""} className="mt-1 border-2 border-murekkep bg-duvar px-3 py-2">
        <option value="">Hepsi</option>
        {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  );
}

async function Content({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const t = schema.tickets;

  const conds: SQL[] = [];
  if (sp.kategori && sp.kategori in ALL_TICKET_CATEGORIES) conds.push(eq(t.category, sp.kategori as "teknik"));
  if (sp.durum && sp.durum in STATUS) conds.push(eq(t.status, sp.durum as "acik"));
  if (sp.oncelik && sp.oncelik in PRIORITY) conds.push(eq(t.priority, sp.oncelik as "normal"));

  const rows = await db
    .select({ ticket: t, company: schema.companies.legalName })
    .from(t)
    .innerJoin(schema.companies, eq(schema.companies.id, t.companyId))
    .where(and(...conds))
    .orderBy(desc(t.updatedAt))
    .limit(200);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Destek talepleri</h1>
      <form method="get" className="mt-8 flex flex-wrap items-end gap-6">
        <Select name="kategori" label="Kategori" options={ALL_TICKET_CATEGORIES} value={sp.kategori} />
        <Select name="durum" label="Durum" options={STATUS} value={sp.durum} />
        <Select name="oncelik" label="Öncelik" options={PRIORITY} value={sp.oncelik} />
        <button type="submit" className="ui bg-emaye px-6 py-2 text-beyaz hover:bg-murekkep">Filtrele</button>
        <Link href="/yonetim/destek" className="underline underline-offset-4">Temizle</Link>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 text-xl">Talep yok.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-y-2 border-murekkep text-left">
            <caption className="sr-only">Destek talepleri</caption>
            <thead>
              <tr className="border-b-2 border-murekkep">
                <th scope="col" className="ui py-3 pr-4">Konu</th>
                <th scope="col" className="ui py-3 pr-4">Firma</th>
                <th scope="col" className="ui py-3 pr-4">Kategori</th>
                <th scope="col" className="ui py-3 pr-4">Öncelik</th>
                <th scope="col" className="ui py-3 pr-4">Durum</th>
                <th scope="col" className="ui py-3">Güncelleme</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-murekkep">
              {rows.map(({ ticket, company }) => (
                <tr key={ticket.id} className={ticket.status === "kapandi" ? "text-soluk" : ""}>
                  <td className="py-3 pr-4">
                    <Link href={`/yonetim/destek/${ticket.id}`} className="underline underline-offset-4">{ticket.subject}</Link>
                  </td>
                  <td className="py-3 pr-4">{company}</td>
                  <td className="py-3 pr-4">{ALL_TICKET_CATEGORIES[ticket.category]}</td>
                  <td className={`py-3 pr-4 ${ticket.priority === "yuksek" ? "text-red-800" : ""}`}>{PRIORITY[ticket.priority]}</td>
                  <td className="py-3 pr-4">{STATUS[ticket.status]}</td>
                  <td className="py-3">{formatDate(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
