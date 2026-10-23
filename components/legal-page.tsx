import Link from "next/link";
import { LEGAL_UPDATED } from "@/lib/legal";
import { AGREEMENT_VERSIONS } from "@/lib/legal";
import type { LegalDoc } from "@/lib/legal-docs";
import { legalPages } from "@/lib/site";

const VERSIONED: Record<string, string> = {
  "mesafeli-satis": AGREEMENT_VERSIONS.mesafeli_satis,
  "on-bilgilendirme": AGREEMENT_VERSIONS.on_bilgilendirme,
  kvkk: AGREEMENT_VERSIONS.kvkk,
};

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const version = VERSIONED[doc.slug];
  return (
    <>
      <section className="border-b border-cizgi bg-kagit">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:pt-20">
          <p className="ui text-sm text-soluk">Yasal</p>
          <h1 className="display mt-2 max-w-4xl text-4xl text-emaye sm:text-5xl">{doc.title}</h1>
          {doc.intro ? <p className="mt-6 max-w-3xl text-lg">{doc.intro}</p> : null}
          <p className="mt-4 text-sm text-soluk">
            {version ? `Sürüm ${version} · ` : ""}Son güncelleme: {LEGAL_UPDATED}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Bu sayfadaki maddeler" className="hidden lg:block">
          <div className="sticky top-24 space-y-1 text-sm">
            <p className="ui mb-2">İçindekiler</p>
            {doc.sections.map((s, i) => (
              <a key={s.heading} href={`#madde-${i + 1}`} className="block py-1 text-soluk hover:text-emaye hover:underline">
                {i + 1}. {s.heading}
              </a>
            ))}
          </div>
        </nav>

        <article className="max-w-3xl space-y-10">
          {doc.sections.map((s, i) => (
            <section key={s.heading} id={`madde-${i + 1}`} className="scroll-mt-24">
              <h2 className="ui border-t-2 border-murekkep pt-4 text-2xl">
                {i + 1}. {s.heading}
              </h2>
              {s.paragraphs.map((p, j) => (
                <p key={j} className="mt-3 leading-relaxed">{p}</p>
              ))}
              {s.list ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-6">
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <aside className="border-t-2 border-murekkep pt-6 text-sm text-soluk">
            <p>Bu metin bilgilendirme ve sözleşme amacıyla hazırlanmıştır. Diğer yasal metinler:</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {legalPages
                .filter((l) => !l.href.endsWith(doc.slug))
                .map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="underline underline-offset-4 hover:text-emaye">{l.label}</Link>
                  </li>
                ))}
            </ul>
          </aside>
        </article>
      </div>
    </>
  );
}
