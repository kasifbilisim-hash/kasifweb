import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { Message } from "@/emails/message";
import { createElement } from "react";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Şifre sıfırlanınca tüm açık oturumlar kapanır: bir e-postayı önceden kaydedip oturumunu açık tutan
    // saldırganın, gerçek sahibi şifreyi yenilediğinde erişimi biter.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const sent = await sendEmail({
        to: user.email,
        subject: "Şifre sıfırlama",
        react: createElement(Message, {
          preview: "Şifrenizi sıfırlayın",
          heading: "Şifrenizi sıfırlayın",
          paragraphs: ["Şifre sıfırlama isteği aldık. Bağlantı bir saat geçerlidir. İstemediyseniz bu e-postayı yok sayın."],
          cta: { label: "Şifreyi sıfırla", url },
        }),
      });
      // Resend yapılandırılmamışsa (yerel geliştirme) bağlantıyı sunucu loguna yazarız.
      if (!sent && process.env.NODE_ENV !== "production") console.log(`[sifre-sifirla] ${user.email}: ${url}`);
    },
  },
  user: {
    additionalFields: {
      // Kayıt sırasında istemciden rol alınmaz; admin yetkisi yalnızca veritabanından verilir.
      role: { type: "string", defaultValue: "customer", input: false },
    },
  },
  // Giriş denemelerini sınırlar. Sunucusuz ortamda örnekler arasında paylaşılsın diye veritabanında tutulur.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 3600, max: 10 },
      "/request-password-reset": { window: 3600, max: 5 },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
