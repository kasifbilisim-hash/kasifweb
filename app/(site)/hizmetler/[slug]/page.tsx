import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Faq, faqJsonLd } from "@/components/faq";
import { PageHead } from "@/components/page-head";
import { CtaBand, SectionHead } from "@/components/sections";
import { AdsMock, PanelMock, Pictogram, SiteMock } from "@/components/visuals";
import { jsonLdString } from "@/lib/jsonld";
import { getService, servicesContent } from "@/lib/services-content";

export function generateStaticParams() {
  return servicesContent.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hizmetler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return { title: s.title, description: s.seoDescription, alternates: { canonical: `/hizmetler/${s.slug}` } };
}

function Visual({ slug }: { slug: string }) {
  if (slug === "google-ads-yonetimi") return <AdsMock />;
  if (slug === "bakim-ve-destek") return <PanelMock />;
  if (slug === "arama-motoru-uyumu") return <SiteMock variant="klinik" />;
  return <SiteMock variant="mobilya" />;
}

export default async function HizmetPage({ params }: PageProps<"/hizmetler/[slug]">) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const others = servicesContent.filter((x) => x.slug !== s.slug);

  return (
    <>
      <PageHead eyebrow="Hizmetler" title={s.title} lead={s.lead}>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/paketler" className="ui bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep">Paketleri gör</Link>
          <Link href="/iletisim" className="ui border-2 border-murekkep px-7 py-4 text-lg hover:bg-murekkep hover:text-beyaz">Soru sorun</Link>
        </div>
      </PageHead>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHead title="Neler yapıyoruz" />
          <ul className="mt-8 divide-y divide-cizgi border-y border-cizgi">
            {s.does.map((d) => (
              <li key={d.title} className="grid gap-2 py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <h3 className="ui text-lg text-emaye">{d.title}</h3>
                <p>{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6 lg:pt-14">
          <Visual slug={s.slug} />
          <p className="text-sm text-soluk">Örnek görünüm. Gerçek tasarım firmanıza göre hazırlanır.</p>
        </div>
      </section>

      <section className="border-y border-cizgi bg-kagit">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3">
          <div>
            <h2 className="ui text-xl text-emaye">Ne teslim ediyoruz</h2>
            <ul className="mt-4 space-y-2.5">
              {s.deliverables.map((x) => (
                <li key={x} className="flex gap-3"><svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1.5 h-4 w-4 shrink-0 text-emaye"><path d="M3 10.5l4.5 4.5L17 5" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg><span>{x}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="ui text-xl text-emaye">Kimler için</h2>
            <ul className="mt-4 list-disc space-y-2.5 pl-5">
              {s.forWho.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="ui text-xl text-emaye">Neler dahil değil</h2>
            <ul className="mt-4 list-disc space-y-2.5 pl-5 text-soluk">
              {s.notIncluded.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1fr_1.7fr]">
        <h2 className="display text-3xl text-emaye">Sık sorulanlar</h2>
        <Faq items={s.faq} />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="ui text-xl">Diğer hizmetler</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/hizmetler/${o.slug}`} className="flex h-full items-start gap-4 border border-cizgi bg-beyaz p-5 hover:border-emaye">
                <span className="text-emaye"><Pictogram name={o.pictogram} /></span>
                <span><span className="ui block">{o.title}</span><span className="block text-sm text-soluk">{o.short}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd(s.faq)) }} />
      <CtaBand />
    </>
  );
}
