import Link from "next/link";
import { count, eq, inArray, sql } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatTL } from "@/lib/packages";
import { requireAdmin } from "@/lib/session";

export default function YonetimPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

const n = async (q: PromiseLike<{ n: number }[]>) => (await q)[0]?.n ?? 0;

async function Content() {
  await requireAdmin();

  const subs = schema.subscriptions;
  const [live, failed, cancelRequests, openTickets, pendingCommitments, mrr] = await Promise.all([
    n(db.select({ n: count() }).from(subs).where(inArray(subs.status, ["active", "payment_failed", "cancel_requested"]))),
    n(db.select({ n: count() }).from(subs).where(eq(subs.status, "payment_failed"))),
    n(db.select({ n: count() }).from(subs).where(eq(subs.status, "cancel_requested"))),
    n(db.select({ n: count() }).from(schema.tickets).where(inArray(schema.tickets.status, ["acik", "yanit_bekliyor"]))),
    n(db.select({ n: count() }).from(schema.commitmentDocuments).where(eq(schema.commitmentDocuments.status, "yuklendi"))),
    // MRR: ödemesi süren (aktif + iptal talebi beklerken hâlâ çekilen) abonelikler, paket fiyatı toplamı
    db
      .select({ total: sql<number>`coalesce(sum(${schema.packages.monthlyPriceKurus}), 0)::int` })
      .from(subs)
      .innerJoin(schema.packages, eq(schema.packages.id, subs.packageId))
      .where(inArray(subs.status, ["active", "cancel_requested"]))
      .then((r) => r[0]?.total ?? 0),
  ]);

  const cards: { label: string; value: string; href: string; hint?: string; alert?: boolean }[] = [
    { label: "Aylık tekrarlayan gelir", value: formatTL(mrr), href: "/yonetim/musteriler", hint: "Aktif ve iptal talebi beklerken çekilen abonelikler" },
    { label: "Abone", value: String(live), href: "/yonetim/musteriler" },
    { label: "Bekleyen taahhütname", value: String(pendingCommitments), href: "/yonetim/taahhutnameler", alert: pendingCommitments > 0 },
    { label: "Yanıt bekleyen talep", value: String(openTickets), href: "/yonetim/destek", alert: openTickets > 0 },
    { label: "İptal talebi", value: String(cancelRequests), href: "/yonetim/iptal", alert: cancelRequests > 0 },
    { label: "Ödemesi alınamayan", value: String(failed), href: "/yonetim/musteriler", alert: failed > 0 },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Gösterge</h1>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className={`block h-full border-4 border-murekkep p-6 hover:bg-beyaz ${c.alert ? "bg-tabela hover:bg-tabela" : ""}`}
            >
              <span className="ui">{c.label}</span>
              <span className="display mt-3 block text-4xl">{c.value}</span>
              {c.hint ? <span className="mt-2 block text-soluk">{c.hint}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
