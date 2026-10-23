import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { NewTicketForm } from "../ticket-forms";

export const metadata: Metadata = { title: "Yeni destek talebi", robots: { index: false } };

export default function YeniTalepPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);
  if (!data) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-xl">Destek talebi açmak için önce abone olmalısınız.</p>
      </section>
    );
  }
  return (
    <AuthShell title="Yeni talep" lead="Sorunu ya da isteğinizi yazın, ekibimiz panelden yanıtlar.">
      <NewTicketForm />
      <p className="mt-6">
        <Link href="/panel/destek" className="underline underline-offset-4">Taleplerime dön</Link>
      </p>
    </AuthShell>
  );
}
