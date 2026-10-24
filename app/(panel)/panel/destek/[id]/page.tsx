import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { ALL_TICKET_CATEGORIES, TICKET_STATUS } from "@/lib/validation/panel";
import { ReplyForm } from "../ticket-forms";

export const metadata: Metadata = { title: "Destek talebi", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default function TalepPage({ params }: PageProps<"/panel/destek/[id]">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content params={params} />
    </Suspense>
  );
}

type Attachment = { path: string; name: string; size: number };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const data = await getPanelData(user.id);
  if (!data || !UUID.test(id)) notFound();

  // Başkasının talebi ile olmayan talep aynı yanıtı verir.
  const [ticket] = await db
    .select()
    .from(schema.tickets)
    .where(and(eq(schema.tickets.id, id), eq(schema.tickets.companyId, data.company.id)));
  if (!ticket) notFound();

  const messages = await db
    .select({ m: schema.ticketMessages, authorRole: schema.user.role })
    .from(schema.ticketMessages)
    .innerJoin(schema.user, eq(schema.user.id, schema.ticketMessages.authorUserId))
    .where(eq(schema.ticketMessages.ticketId, ticket.id))
    .orderBy(asc(schema.ticketMessages.createdAt));

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <p>
        <Link href="/panel/destek" className="underline underline-offset-4">Taleplerim</Link>
      </p>
      <h1 className="display mt-4 text-3xl text-emaye sm:text-4xl">{ticket.subject}</h1>
      <p className="mt-2 text-soluk">
        {ALL_TICKET_CATEGORIES[ticket.category]} · {TICKET_STATUS[ticket.status]}
      </p>

      <ol className="mt-10 space-y-6">
        {messages.map(({ m, authorRole }) => {
          const ours = authorRole === "admin";
          const files = (m.attachments as Attachment[]) ?? [];
          return (
            <li key={m.id} className={`border-2 border-murekkep p-5 ${ours ? "bg-beyaz" : "bg-duvar"}`}>
              <p className="ui">{ours ? "Kaşif Yazılım" : "Siz"}</p>
              <p className="text-soluk">{formatDateTime(m.createdAt)}</p>
              <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
              {files.length > 0 && (
                <ul className="mt-3">
                  {files.map((f) => (
                    <li key={f.path}>
                      <a href={`/api/dosya?p=${encodeURIComponent(f.path)}`} className="underline underline-offset-4">
                        {f.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-12 border-t-4 border-murekkep pt-8">
        <h2 className="ui mb-5 text-2xl">{ticket.status === "kapandi" ? "Talep kapalı. Yazarsanız yeniden açılır" : "Yanıt yazın"}</h2>
        <ReplyForm ticketId={ticket.id} />
      </div>
    </section>
  );
}
