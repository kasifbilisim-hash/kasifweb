"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/auth/field";
import { submitClass } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { safeNext } from "@/lib/safe-next";

export function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(e.currentTarget);
    const { error } = await authClient.signUp.email({
      name: String(data.get("name")).trim(),
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
    if (error) {
      setError(authErrorMessage(error));
      setPending(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field id="name" label="Ad soyad" autoComplete="name" />
      <Field id="email" label="E-posta" type="email" autoComplete="email" />
      <Field
        id="password"
        label="Şifre (en az 8 karakter)"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />
      {error ? (
        <p role="alert" className="text-red-800">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Hesap açılıyor" : "Hesap oluştur"}
      </button>
      <p>
        Zaten hesabınız var mı?{" "}
        <Link href={`/giris${next !== "/panel" ? `?next=${encodeURIComponent(next)}` : ""}`} className="underline underline-offset-4">
          Giriş yapın
        </Link>
      </p>
    </form>
  );
}
