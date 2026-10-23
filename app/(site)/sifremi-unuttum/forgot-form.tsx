"use client";

import { useState } from "react";
import { Field } from "@/components/auth/field";
import { submitClass } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const data = new FormData(e.currentTarget);
    await authClient.requestPasswordReset({
      email: String(data.get("email")),
      redirectTo: "/sifre-sifirla",
    });
    // Hesap var mı yok mu belli etmemek için sonuç ne olursa olsun aynı mesaj.
    setSent(true);
    setPending(false);
  }

  if (sent) {
    return (
      <p role="status" className="text-lg">
        Bu e-posta ile kayıtlı bir hesap varsa, şifre yenileme bağlantısı gönderildi.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field id="email" label="E-posta" type="email" autoComplete="email" />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Gönderiliyor" : "Bağlantı gönder"}
      </button>
    </form>
  );
}
