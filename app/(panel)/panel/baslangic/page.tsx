import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { emptyOnboarding, onboardingDataSchema } from "@/lib/validation/onboarding";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Başlangıç formu", robots: { index: false } };

export default function BaslangicPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);

  if (!data?.subscription || !data.package) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Başlangıç formu</h1>
        <p className="mt-6 max-w-xl text-xl">
          Form aboneliğinizden sonra burada açılır.{" "}
          <Link href="/paketler" className="underline underline-offset-4">
            Paketlere göz atın
          </Link>
          .
        </p>
      </section>
    );
  }

  // Veritabanındaki taslak eski şemadan kalmış olabilir; parse eksik alanları varsayılanla doldurur.
  const saved = onboardingDataSchema.safeParse(data.onboarding?.data ?? {});
  const initial = saved.success ? saved.data : emptyOnboarding();
  const locked = data.onboarding?.status === "gonderildi";

  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Başlangıç formu</h1>
      <p className="mt-5 max-w-2xl text-xl">
        Siteyi hazırlamak için bu bilgilere ihtiyacımız var. İstediğiniz zaman taslağı kaydedip
        sonra devam edebilirsiniz.
      </p>
      {locked && (
        <p role="status" className="levha mt-8 bg-tabela p-5">
          Formunuz gönderildi. Değişiklik için destek talebi açabilirsiniz.
        </p>
      )}
      <div className="mt-10 border-4 border-murekkep bg-beyaz p-6 md:p-8">
        <OnboardingForm initial={initial} hasAds={data.package.includesAds} locked={locked} />
      </div>
    </section>
  );
}
