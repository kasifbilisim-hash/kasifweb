import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { ALL_TICKET_CATEGORIES, TICKET_STATUS } from "@/lib/validation/panel";

export const metadata: Metadata = { title: "Destek", robots: { index: false } };

export default function DestekPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);

  if (!data) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Destek</h1>
        <p className="mt-6 max-w-xl text-xl">Destek talebi açmak için önce abone olmalısınız.</p>
      </section>
    );
  }

  const tickets = await db
    .select()
    .from(schema.tickets)
    .where(eq(schema.tickets.companyId, data.company.id))
    .orderBy(desc(schema.tickets.updatedAt));

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Destek</h1>
        <Link href="/panel/destek/yeni" className="ui bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep">
          Yeni talep
        </Link>
      </div>
      {tickets.length === 0 ? (
        <p className="mt-10 max-w-xl text-xl">Henüz talebiniz yok. Bir sorun ya da değişiklik isteğiniz olursa yeni talep açın.</p>
      ) : (
        <ul className="mt-10 divide-y-2 divide-murekkep border-y-2 border-murekkep">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/panel/destek/${t.id}`} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 hover:bg-beyaz">
                <span>
                  <span className="ui text-xl">{t.subject}</span>
                  <span className="block text-soluk">{ALL_TICKET_CATEGORIES[t.category]} · {formatDate(t.updatedAt)}</span>
                </span>
                <span>{TICKET_STATUS[t.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
