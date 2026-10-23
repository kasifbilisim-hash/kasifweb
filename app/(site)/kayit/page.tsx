import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Kayıt ol", robots: { index: false } };

export default function KayitPage() {
  return (
    <AuthShell
      title="Hesap oluştur"
      lead="Abonelik başlatmak için önce hesabınızı açın. Firma bilgilerini sonraki adımda girersiniz."
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
