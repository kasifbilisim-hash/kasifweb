import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false } };

export default function GirisPage() {
  return (
    <AuthShell
      title="Giriş yap"
      lead="Aboneliğinizi, proje durumunuzu ve destek taleplerinizi panelden takip edin."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
