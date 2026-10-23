"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/auth/field";
import { submitClass } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

export function ResetForm() {
  const token = useSearchParams().get("token");
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <p>
        Bağlantı geçersiz.{" "}
        <Link href="/sifremi-unuttum" className="underline underline-offset-4">
          Yeni bağlantı isteyin
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <p role="status" className="text-lg">
        Şifreniz değişti.{" "}
        <Link href="/giris" className="underline underline-offset-4">
          Giriş yapın
        </Link>
        .
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(e.currentTarget);
    const { error } = await authClient.resetPassword({
      newPassword: String(data.get("password")),
      token: token!,
    });
    if (error) {
      setError(authErrorMessage(error));
      setPending(false);
      return;
    }
    setDone(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field
        id="password"
        label="Yeni şifre (en az 8 karakter)"
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
        {pending ? "Kaydediliyor" : "Şifreyi kaydet"}
      </button>
    </form>
  );
}
