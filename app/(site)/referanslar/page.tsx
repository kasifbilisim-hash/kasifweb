import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/page-head";
import { CtaBand, SectionHead } from "@/components/sections";
import { SiteMock } from "@/components/visuals";
import { references } from "@/lib/references";

export const metadata: Metadata = {
  title: "Referanslar",
  description: "Kaşif Yazılım'ın hazırladığı ve yayında olan web siteleri.",
  alternates: { canonical: "/referanslar" },
};

const samples = [
  { v: "mobilya" as const, title: "Üretici ve esnaf siteleri", text: "Ürün ve hizmet kategorilerini net gösteren, telefon ve WhatsApp'a yönlendiren yerel işletme tasarımı." },
  { v: "hukuk" as const, title: "Danışmanlık ve büro siteleri", text: "Güven veren, sade ve içerik odaklı tasarım; randevu ve iletişim yönlendirmesi öne çıkar." },
  { v: "klinik" as const, title: "Sağlık ve hizmet siteleri", text: "Randevu odaklı, mobilde rahat kullanılan, hizmetleri açıkça anlatan düzen." },
];

export default function ReferanslarPage() {
  return (
    <>
      <PageHead
        eyebrow="Referanslar"
        title="Yayındaki işlerimiz"
        lead="Hazırladığımız ve yayında olan siteler. Adrese tıklayıp canlı halini inceleyebilirsiniz."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {references.map((r) => (
            <li key={r.host}>
              <a
                href={`https://${r.host}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden border border-cizgi bg-beyaz hover:border-emaye"
              >
                <Image
                  src={r.image}
                  alt={`${r.name} ana sayfasının ekran görüntüsü`}
                  width={1280}
                  height={800}
                  sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[16/10] w-full border-b border-cizgi object-cover object-top"
                />
                <span className="flex flex-1 flex-col p-6">
                  <span className="ui text-xl group-hover:underline group-hover:underline-offset-4">{r.name}</span>
                  <span className="mt-1 text-soluk">{r.host}</span>
                  <span className="ui mt-auto pt-5 text-emaye">
                    Siteyi aç<span className="sr-only"> (yeni sekmede açılır): {r.name}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-cizgi bg-kagit">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHead title="Sektöre göre örnek tasarımlar" lead="Yaklaşımımızı göstermek için hazırlanmış örneklerdir; gerçek firmalara ait değildir." />
          <div className="mt-12 space-y-16">
            {samples.map((s, i) => (
              <article key={s.title} className="grid items-center gap-8 md:grid-cols-[1fr_1.3fr]">
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <h3 className="display text-2xl text-emaye">{s.title}</h3>
                  <p className="mt-3 text-lg">{s.text}</p>
                  <p className="mt-3 text-sm text-soluk">Örnek tasarım</p>
                </div>
                <SiteMock variant={s.v} />
              </article>
            ))}
          </div>
          <p className="mt-16 text-lg">
            Kendi siteniz için neler yapabileceğimizi konuşmak ister misiniz? <Link href="/iletisim" className="underline underline-offset-4">Bizi arayın ya da WhatsApp&apos;tan yazın</Link>.
          </p>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
