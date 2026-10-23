import { z } from "zod";

export const TICKET_CATEGORIES = {
  teknik: "Teknik sorun",
  icerik: "İçerik değişikliği",
  fatura: "Fatura ve ödeme",
  reklam: "Google Ads",
  diger: "Diğer",
} as const;

export type CustomerTicketCategory = keyof typeof TICKET_CATEGORIES;

// "iptal" kategorisi yalnızca iptal talebi akışıyla açılır.
export const ALL_TICKET_CATEGORIES: Record<string, string> = { ...TICKET_CATEGORIES, iptal: "İptal talebi" };

export const TICKET_STATUS: Record<string, string> = {
  acik: "Açık",
  yanit_bekliyor: "Yanıtınız iletildi, bekleniyor",
  cevaplandi: "Cevaplandı",
  kapandi: "Kapandı",
};

const text = (min: number, max: number, empty: string) =>
  z.string().trim().min(min, empty).max(max, `En fazla ${max} karakter olabilir.`);

export const newTicketSchema = z.object({
  category: z.enum(Object.keys(TICKET_CATEGORIES) as [CustomerTicketCategory, ...CustomerTicketCategory[]], {
    message: "Bir kategori seçin.",
  }),
  subject: text(3, 120, "Konuyu yazın."),
  message: text(5, 5000, "Mesajınızı yazın."),
});

export const ticketReplySchema = z.object({ message: text(1, 5000, "Mesajınızı yazın.") });

export const cancelSchema = z.object({
  reason: text(10, 2000, "İptal nedenini en az 10 karakterle yazın."),
});

export const revisionSchema = z.object({ note: text(5, 3000, "Neyin değişmesini istediğinizi yazın.") });

/** İlk hata mesajını alan adıyla döndürür. */
export function firstErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
