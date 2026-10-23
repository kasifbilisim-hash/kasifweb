import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Yeni şifre belirle", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Yeni şifre belirle">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
