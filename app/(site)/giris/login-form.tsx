"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/auth/field";
import { submitClass } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { safeNext } from "@/lib/safe-next";

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
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
      <Field id="email" label="E-posta" type="email" autoComplete="email" />
      <Field id="password" label="Şifre" type="password" autoComplete="current-password" />
      {error ? (
        <p role="alert" className="text-red-800">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Giriş yapılıyor" : "Giriş yap"}
      </button>
      <p>
        <Link href="/sifremi-unuttum" className="underline underline-offset-4">
          Şifremi unuttum
        </Link>
        <br />
        Hesabınız yok mu?{" "}
        <Link href={`/kayit${next !== "/panel" ? `?next=${encodeURIComponent(next)}` : ""}`} className="underline underline-offset-4">
          Kayıt olun
        </Link>
      </p>
    </form>
  );
}
