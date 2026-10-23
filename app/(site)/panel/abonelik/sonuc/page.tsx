import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Abonelik sonucu", robots: { index: false } };

export default function SonucPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  return (
    <Suspense fallback={null}>
      <Result searchParams={searchParams} />
    </Suspense>
  );
}

async function Result({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const { durum } = await searchParams;
  const ok = durum === "basarili";

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">
        {ok ? "Aboneliğiniz başladı" : "Ödeme tamamlanamadı"}
      </h1>
      <p className="mt-6 max-w-xl text-xl">
        {ok
          ? "Sıradaki adım taahhütnamenin imzalanıp yüklenmesi. Onaylanmadan tasarım aşamasına geçmiyoruz."
          : "Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz. Çekim yapıldığı halde bu ekranı görüyorsanız bize yazın, durumu kontrol edelim."}
      </p>
      <div className="mt-8 flex flex-wrap gap-6">
        <Link href="/panel" className="ui bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep">
          Panele git
        </Link>
        {!ok ? (
          <Link href="/paketler" className="ui self-center text-lg underline underline-offset-4">
            Paketlere dön
          </Link>
        ) : null}
      </div>
    </section>
  );
}
