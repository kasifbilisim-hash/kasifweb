import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Şifremi unuttum", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell
      title="Şifremi unuttum"
      lead="E-posta adresinizi yazın, şifre yenileme bağlantısı gönderelim."
    >
      <ForgotForm />
    </AuthShell>
  );
}
