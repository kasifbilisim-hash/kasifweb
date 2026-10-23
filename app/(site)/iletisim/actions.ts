"use server";

import { z } from "zod";
import { notifyAdminRaw } from "@/lib/notify";
import { clientIp, rateLimit, tooManyMessage } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Adınızı yazın.").max(100),
  email: z.string().trim().email("Geçerli bir e-posta yazın.").max(200),
  message: z.string().trim().min(10, "Mesajınız en az 10 karakter olmalı.").max(3000),
});

export type ContactState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "email" | "message", string>>;
};

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: NonNullable<ContactState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { ok: false, errors };
  }

  const limited = await rateLimit(`contact:${await clientIp()}`, 5, 3600);
  if (!limited.ok) return { ok: false, message: tooManyMessage(limited) };

  await notifyAdminRaw({
    subject: `İletişim formu: ${parsed.data.name}`,
    heading: "İletişim formundan mesaj geldi",
    paragraphs: [`Ad: ${parsed.data.name}`, `E-posta: ${parsed.data.email}`, parsed.data.message],
  });
  return { ok: true, message: "Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız." };
}
