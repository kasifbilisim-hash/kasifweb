"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { requireAdmin } from "@/lib/session";
import { storeUpload } from "@/lib/uploads";
import { adminReplySchema } from "@/lib/validation/admin";

export type AdminTicketState = {
  ok?: boolean;
  message?: string;
  error?: string;
  text?: string;
  // React 19 action sonrası alanları sıfırlar; hata/başarı sonrası formu yeniden kurmak için.
  version?: number;
};

export async function replyAsAdmin(ticketId: string, _prev: AdminTicketState, formData: FormData): Promise<AdminTicketState> {
  const admin = await requireAdmin();
  const [ticket] = await db.select().from(schema.tickets).where(eq(schema.tickets.id, ticketId));
  if (!ticket) return { message: "Talep bulunamadı." };

  const raw = String(formData.get("message") ?? "");
  const parsed = adminReplySchema.safeParse({ message: raw });
  if (!parsed.success) return { error: parsed.error.issues[0].message, text: raw, version: Date.now() };

  let attachments: { path: string; name: string; size: number }[] = [];
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const up = await storeUpload({ companyId: ticket.companyId, folder: "tickets", file, allowed: ["pdf", "jpg", "png", "webp"] });
    if (!up.ok) return { error: up.error, text: raw, version: Date.now() };
    attachments = [up.file];
  }

  await db.insert(schema.ticketMessages).values({
    ticketId: ticket.id,
    authorUserId: admin.id,
    message: parsed.data.message,
    attachments,
  });
  await db.update(schema.tickets).set({ status: "cevaplandi" }).where(eq(schema.tickets.id, ticket.id));
  await writeAudit({
    actorUserId: admin.id,
    action: "ticket.replied",
    targetTable: "tickets",
    targetId: ticket.id,
    details: { from: ticket.status, to: "cevaplandi" },
  });
  await notify({ to: "customer", template: "ticket_reply", subjectRef: ticket.id });

  revalidatePath(`/yonetim/destek/${ticket.id}`);
  revalidatePath("/yonetim/destek");
  revalidatePath("/yonetim");
  return { ok: true, message: "Yanıt gönderildi.", version: Date.now() };
}

const STATUSES = ["acik", "yanit_bekliyor", "cevaplandi", "kapandi"] as const;
const PRIORITIES = ["dusuk", "normal", "yuksek"] as const;

/** Kapat / yeniden aç / öncelik değiştir. */
export async function updateTicket(ticketId: string, formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const [ticket] = await db.select().from(schema.tickets).where(eq(schema.tickets.id, ticketId));
  if (!ticket) return;

  const status = STATUSES.find((s) => s === formData.get("status"));
  const priority = PRIORITIES.find((p) => p === formData.get("priority"));
  const set: { status?: (typeof STATUSES)[number]; priority?: (typeof PRIORITIES)[number] } = {};
  if (status && status !== ticket.status) set.status = status;
  if (priority && priority !== ticket.priority) set.priority = priority;
  if (!set.status && !set.priority) return;

  await db.update(schema.tickets).set(set).where(eq(schema.tickets.id, ticket.id));
  await writeAudit({
    actorUserId: admin.id,
    action: set.status === "kapandi" ? "ticket.closed" : "ticket.updated",
    targetTable: "tickets",
    targetId: ticket.id,
    details: { from: { status: ticket.status, priority: ticket.priority }, to: set },
  });
  revalidatePath(`/yonetim/destek/${ticket.id}`);
  revalidatePath("/yonetim/destek");
  revalidatePath("/yonetim");
}
