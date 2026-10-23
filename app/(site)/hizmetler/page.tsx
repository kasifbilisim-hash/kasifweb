import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/page-head";
import { CtaBand } from "@/components/sections";
import { Pictogram } from "@/components/visuals";
import { servicesContent } from "@/lib/services-content";

export const metadata: Metadata = {
  title: "Hizmetler",
  description: "Kurumsal web sitesi, Google Ads yönetimi, bakım ve destek, arama motoru uyumu: abonelik ya da tek seferlik paketle tek elden.",
  alternates: { canonical: "/hizmetler" },
};

export default function HizmetlerPage() {
  return (
    <>
      <PageHead eyebrow="Hizmetler" title="Dört iş, tek elden" lead="Siteyi kurmak, reklamı yönetmek, sonrasında bakım ve destek. Hepsi tek sözleşme ve tek panel altında." />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <ul className="grid gap-px border border-cizgi bg-cizgi md:grid-cols-2">
          {servicesContent.map((s) => (
            <li key={s.slug} className="bg-beyaz">
              <Link href={`/hizmetler/${s.slug}`} className="group flex h-full flex-col p-8 hover:bg-kagit">
                <span className="text-emaye"><Pictogram name={s.pictogram} className="h-10 w-10" /></span>
                <h2 className="display mt-5 text-2xl text-emaye">{s.title}</h2>
                <p className="mt-3 text-soluk">{s.short}</p>
                <span className="ui mt-6 text-emaye group-hover:underline group-hover:underline-offset-4">Ayrıntılar</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-3xl text-lg">
          Hizmetleri tek tek satmıyoruz; paketlerimiz bu işleri birlikte kapsar. Hangi paketin neyi içerdiğini{" "}
          <Link href="/paketler" className="underline underline-offset-4">Paketler</Link> sayfasında görebilirsiniz.
        </p>
      </section>
      <CtaBand />
    </>
  );
}
