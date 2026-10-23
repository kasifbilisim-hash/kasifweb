"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getPanelData } from "@/lib/panel-data";
import { rateLimit, tooManyMessage } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { storeUpload } from "@/lib/uploads";
import { firstErrors, newTicketSchema, ticketReplySchema } from "@/lib/validation/panel";

export type TicketState = {
  ok?: boolean;
  // React 19 action sonrası kontrolsüz alanları sıfırlar (select seçimi dahil). Hata durumunda değerleri geri göndeririz;
  // version değişince form yeniden kurulur ve alanlar bu değerlerle açılır.
  version?: number;
  message?: string;
  errors?: Record<string, string>;
  values?: { category?: string; subject?: string; message?: string };
};

type Attachment = { path: string; name: string; size: number };

/** İsteğe bağlı tek ek. Dosya seçilmediyse (boş input) ek yok sayılır. */
async function readAttachment(companyId: string, formData: FormData): Promise<{ error: string } | { files: Attachment[] }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { files: [] };
  const result = await storeUpload({ companyId, folder: "tickets", file, allowed: ["pdf", "jpg", "png", "webp"] });
  return result.ok ? { files: [result.file] } : { error: result.error };
}

export async function createTicket(_prev: TicketState, formData: FormData): Promise<TicketState> {
  const user = await requireUser();
  const limited = await rateLimit(`ticket:${user.id}`, 10, 3600);
  if (!limited.ok) return { message: tooManyMessage(limited), version: Date.now() };
  const data = await getPanelData(user.id);
  if (!data) return { message: "Önce abone olmalısınız." };

  const raw = {
    category: String(formData.get("category") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const parsed = newTicketSchema.safeParse(raw);
  if (!parsed.success) return { errors: firstErrors(parsed.error), values: raw, version: Date.now() };

  const attachment = await readAttachment(data.company.id, formData);
  if ("error" in attachment) return { errors: { file: attachment.error }, values: raw, version: Date.now() };

  const [ticket] = await db
    .insert(schema.tickets)
    .values({ companyId: data.company.id, category: parsed.data.category, subject: parsed.data.subject, status: "acik" })
    .returning({ id: schema.tickets.id });
  try {
    await db.insert(schema.ticketMessages).values({
      ticketId: ticket.id,
      authorUserId: user.id,
      message: parsed.data.message,
      attachments: attachment.files,
    });
  } catch (error) {
    await db.delete(schema.tickets).where(eq(schema.tickets.id, ticket.id));
    throw error;
  }

  await notify({ to: "admin", template: "ticket_created", subjectRef: ticket.id });
  revalidatePath("/panel/destek");
  redirect(`/panel/destek/${ticket.id}`);
}

export async function replyToTicket(ticketId: string, _prev: TicketState, formData: FormData): Promise<TicketState> {
  const user = await requireUser();
  const limited = await rateLimit(`ticket-reply:${user.id}`, 30, 3600);
  if (!limited.ok) return { message: tooManyMessage(limited), version: Date.now() };
  const data = await getPanelData(user.id);
  if (!data) return { message: "Talep bulunamadı." };

  // Sahiplik: talep bu kullanıcının firmasına ait olmalı.
  const [ticket] = await db
    .select()
    .from(schema.tickets)
    .where(and(eq(schema.tickets.id, ticketId), eq(schema.tickets.companyId, data.company.id)));
  if (!ticket) return { message: "Talep bulunamadı." };

  const raw = { message: String(formData.get("message") ?? "") };
  const parsed = ticketReplySchema.safeParse(raw);
  if (!parsed.success) return { errors: firstErrors(parsed.error), values: raw, version: Date.now() };

  const attachment = await readAttachment(data.company.id, formData);
  if ("error" in attachment) return { errors: { file: attachment.error }, values: raw, version: Date.now() };

  await db.insert(schema.ticketMessages).values({
    ticketId: ticket.id,
    authorUserId: user.id,
    message: parsed.data.message,
    attachments: attachment.files,
  });
  // Kapalı talebe yazmak yeniden açar; yöneticinin görmesi için "yanıt bekliyor" olur.
  await db.update(schema.tickets).set({ status: "yanit_bekliyor" }).where(eq(schema.tickets.id, ticket.id));

  await notify({ to: "admin", template: "ticket_reply", subjectRef: ticket.id });
  revalidatePath(`/panel/destek/${ticket.id}`);
  revalidatePath("/panel/destek");
  return { ok: true, message: "Mesajınız gönderildi.", values: {}, version: Date.now() };
}
