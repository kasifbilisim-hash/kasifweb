import "server-only";
import { createElement } from "react";
import { Message } from "@/emails/message";
import { resolveCustomer } from "@/lib/email/recipients";
import { sendEmail } from "@/lib/email/send";
import { buildEmail } from "@/lib/email/templates";

type Notification = { to: "customer" | "admin"; template: string; subjectRef: string; data?: Record<string, unknown> };

const baseUrl = () => process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

/**
 * İşlem e-postası. Hiçbir koşulda fırlatmaz (e-posta başarısızlığı asıl işlemi bozmasın).
 * Alıcı: müşteri için subjectRef'ten firma sahibinin e-postası, admin için ADMIN_EMAIL.
 */
export async function notify(n: Notification): Promise<void> {
  try {
    const recipient = await resolveCustomer(n.subjectRef);
    const to = n.to === "admin" ? process.env.ADMIN_EMAIL : recipient?.email;
    const content = buildEmail(n.to, n.template, { company: recipient?.company, data: n.data });
    if (!content) {
      console.warn(`[notify] şablon yok: ${n.to}/${n.template}`);
      return;
    }
    if (!to) {
      console.warn(`[notify] alıcı bulunamadı: ${n.to}/${n.template} ref=${n.subjectRef}${n.to === "admin" ? " (ADMIN_EMAIL tanımlı değil)" : ""}`);
      return;
    }
    await sendEmail({
      to,
      subject: content.subject,
      react: createElement(Message, {
        preview: content.heading,
        heading: content.heading,
        paragraphs: content.paragraphs,
        cta: content.cta ? { label: content.cta.label, url: `${baseUrl()}${content.cta.path}` } : undefined,
      }),
    });
  } catch (err) {
    console.error("[notify] hata", n.template, err);
  }
}

/** Bir kimliğe bağlı olmayan yönetici bildirimleri (iletişim formu, günlük özet). */
export async function notifyAdminRaw(args: {
  subject: string;
  heading: string;
  paragraphs: string[];
  cta?: { label: string; path: string };
}): Promise<void> {
  try {
    const to = process.env.ADMIN_EMAIL;
    if (!to) {
      console.warn("[notify] ADMIN_EMAIL tanımlı değil:", args.subject);
      return;
    }
    await sendEmail({
      to,
      subject: args.subject,
      react: createElement(Message, {
        preview: args.heading,
        heading: args.heading,
        paragraphs: args.paragraphs,
        cta: args.cta ? { label: args.cta.label, url: `${baseUrl()}${args.cta.path}` } : undefined,
      }),
    });
  } catch (err) {
    console.error("[notify] hata", args.subject, err);
  }
}
