import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";

/**
 * Resend ile gönderir. RESEND_API_KEY / EMAIL_FROM yoksa gönderilmez, konu sunucu loguna yazılır (yerel geliştirme).
 * Hata fırlatmaz: e-posta gönderilemedi diye müşterinin işlemi başarısız olmamalı. Dönüş: gönderildi mi.
 */
export async function sendEmail(args: { to: string; subject: string; react: ReactElement }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[email:log] ${args.to}: ${args.subject} (RESEND_API_KEY / EMAIL_FROM tanımlı değil, gönderilmedi)`);
    return false;
  }
  try {
    const { error } = await new Resend(apiKey).emails.send({ from, to: args.to, subject: args.subject, react: args.react });
    if (error) {
      console.error("[email] Resend hatası", error.name, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] gönderilemedi", err);
    return false;
  }
}
