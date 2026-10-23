import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { CancelForm } from "./cancel-form";

export const metadata: Metadata = { title: "Aboneliği iptal et", robots: { index: false } };

export default function IptalPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);
  const sub = data?.subscription;

  if (!sub) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Aboneliği iptal et</h1>
        <p className="mt-6 max-w-xl text-xl">İptal edilecek aktif bir aboneliğiniz yok.</p>
      </section>
    );
  }

  if (sub.status === "cancel_requested") {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">İptal talebiniz alındı</h1>
        <p className="mt-6 max-w-xl text-xl">
          Talebiniz ekibimize iletildi, değerlendirme sürüyor. Onaylanana kadar hizmetiniz ve aylık çekim sürer. Alan adınız sizde kalır.
        </p>
        <p className="mt-6">
          <Link href="/panel/destek" className="underline underline-offset-4">Destek taleplerim</Link>
        </p>
      </section>
    );
  }

  return (
    <AuthShell
      title="Aboneliği iptal et"
      lead="12 ay içinde memnun kalmazsanız iptal talebi açabilirsiniz. Talep hemen iptal etmez: ekibimiz değerlendirir, onaylarsa aboneliğiniz sonlanır. Alan adınız sizde kalır."
    >
      <CancelForm />
    </AuthShell>
  );
}
