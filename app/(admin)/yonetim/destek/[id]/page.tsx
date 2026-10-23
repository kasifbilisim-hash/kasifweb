import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { ALL_TICKET_CATEGORIES } from "@/lib/validation/panel";
import { updateTicket } from "../actions";
import { AdminReplyForm } from "../reply-form";

export const metadata: Metadata = { title: "Destek talebi", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;
const STATUS: Record<string, string> = { acik: "Açık", yanit_bekliyor: "Müşteri yazdı", cevaplandi: "Cevaplandı", kapandi: "Kapandı" };
const PRIORITY: Record<string, string> = { dusuk: "Düşük", normal: "Normal", yuksek: "Yüksek" };

export default function TalepPage({ params }: PageProps<"/yonetim/destek/[id]">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content params={params} />
    </Suspense>
  );
}

type Attachment = { path: string; name: string; size: number };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  if (!UUID.test(id)) notFound();

  const [row] = await db
    .select({ ticket: schema.tickets, company: schema.companies })
    .from(schema.tickets)
    .innerJoin(schema.companies, eq(schema.companies.id, schema.tickets.companyId))
    .where(eq(schema.tickets.id, id));
  if (!row) notFound();
  const { ticket, company } = row;

  const messages = await db
    .select({ m: schema.ticketMessages, role: schema.user.role, name: schema.user.name })
    .from(schema.ticketMessages)
    .innerJoin(schema.user, eq(schema.user.id, schema.ticketMessages.authorUserId))
    .where(eq(schema.ticketMessages.ticketId, ticket.id))
    .orderBy(asc(schema.ticketMessages.createdAt));

  const update = updateTicket.bind(null, ticket.id);

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <p><Link href="/yonetim/destek" className="underline underline-offset-4">Tüm talepler</Link></p>
        <h1 className="display mt-4 text-3xl text-emaye sm:text-4xl">{ticket.subject}</h1>
        <p className="mt-2 text-soluk">
          <Link href={`/yonetim/musteriler/${company.id}`} className="underline underline-offset-4">{company.legalName}</Link>
          {" · "}{ALL_TICKET_CATEGORIES[ticket.category]}
        </p>

        <ol className="mt-10 space-y-6">
          {messages.map(({ m, role, name }) => {
            const files = (m.attachments as Attachment[]) ?? [];
            return (
              <li key={m.id} className={`border-2 border-murekkep p-5 ${role === "admin" ? "bg-beyaz" : "bg-duvar"}`}>
                <p className="ui">{role === "admin" ? `Ekip (${name})` : name}</p>
                <p className="text-soluk">{formatDateTime(m.createdAt)}</p>
                <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
                {files.length > 0 && (
                  <ul className="mt-3">
                    {files.map((f) => (
                      <li key={f.path}>
                        <a href={`/api/dosya?p=${encodeURIComponent(f.path)}`} className="underline underline-offset-4">{f.name}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-12 border-t-4 border-murekkep pt-8">
          <AdminReplyForm ticketId={ticket.id} />
        </div>
      </div>

      <aside className="h-fit space-y-6 border-4 border-murekkep bg-beyaz p-6">
        <form action={update} className="space-y-4">
          <div>
            <label htmlFor="status" className="ui">Durum</label>
            <select id="status" name="status" defaultValue={ticket.status} className="mt-1 block w-full border-2 border-murekkep bg-duvar px-3 py-2">
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="ui">Öncelik</label>
            <select id="priority" name="priority" defaultValue={ticket.priority} className="mt-1 block w-full border-2 border-murekkep bg-duvar px-3 py-2">
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button type="submit" className="ui border-2 border-murekkep px-5 py-2">Kaydet</button>
        </form>
        {ticket.category === "iptal" && (
          <p>
            Bu bir iptal talebi. Karar için <Link href="/yonetim/iptal" className="underline underline-offset-4">İptal talepleri</Link> sayfasını kullanın.
          </p>
        )}
      </aside>
    </section>
  );
}
