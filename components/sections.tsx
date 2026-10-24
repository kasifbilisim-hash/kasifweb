import type { ReactNode } from "react";
import { packageWaMessage } from "@/lib/contact";
import { domainFeeLine, formatTL, type PackageInfo } from "@/lib/packages";
import { ContactPair } from "./contact-buttons";

export function SectionHead({ title, lead, light = false, id }: { title: string; lead?: string; light?: boolean; id?: string }) {
  return (
    <div className="max-w-3xl">
      <h2 id={id} className={`display text-3xl sm:text-4xl ${light ? "text-beyaz" : "text-emaye"}`}>{title}</h2>
      {lead ? <p className={`mt-4 text-lg ${light ? "text-beyaz/80" : "text-soluk"}`}>{lead}</p> : null}
    </div>
  );
}

/** Sayfa sonu çağrısı. */
export function CtaBand({ title = "Sitenizi ve reklamınızı bu ay kuralım.", text = "Bizi arayın ya da WhatsApp'tan yazın, size uygun paketi birlikte seçelim.", children }: { title?: string; text?: string; children?: ReactNode }) {
  return (
    <section className="bg-tabela">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-14">
        <div className="max-w-2xl">
          <h2 className="display text-3xl text-murekkep sm:text-4xl">{title}</h2>
          <p className="mt-3 text-lg text-murekkep/85">{text}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {children ?? <ContactPair surface="yellow" />}
        </div>
      </div>
    </section>
  );
}

/** Paket kartları: veritabanındaki paketlerin tamamı, sayıdan bağımsız. */
export function PackageGrid({ packages }: { packages: PackageInfo[] }) {
  if (packages.length === 0) {
    return <p className="text-lg text-soluk">Paketler yakında burada olacak.</p>;
  }
  const cols = packages.length === 1 ? "md:grid-cols-1 max-w-xl" : packages.length <= 2 || packages.length === 4 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-8 ${cols}`}>
      {packages.map((pkg) => {
        const open = pkg.monthlyPriceKurus !== null;
        return (
          <article key={pkg.id} className={`flex flex-col p-8 md:p-10 ${pkg.featured ? "levha bg-tabela" : "border-2 border-murekkep bg-beyaz"}`}>
            {pkg.featured ? <p className="ui mb-3 text-sm">Öne çıkan</p> : null}
            <h3 className="ui text-2xl">{pkg.name}</h3>
            {open ? (
              <>
                <p className="display mt-6 text-5xl">{formatTL(pkg.monthlyPriceKurus)}</p>
                <p className="mt-1">{pkg.billingType === "one_time" ? "tek seferlik" : "aylık"}{pkg.includesAds ? ", reklam bütçesi hariç" : ""}</p>
              </>
            ) : (
              <>
                <p className="display mt-6 text-3xl">Fiyat yakında</p>
                <p className="mt-1">{pkg.billingType === "one_time" ? "tek seferlik" : "aylık"}{pkg.includesAds ? ", reklam bütçesi hariç" : ""}</p>
              </>
            )}
            {domainFeeLine(pkg) ? <p className="ui mt-2 text-[0.95rem]">{domainFeeLine(pkg)}</p> : null}
            {pkg.summary ? <p className="mt-6">{pkg.summary}</p> : null}
            {pkg.features.length > 0 ? (
              <ul className="mt-6 space-y-2.5 border-t-2 border-murekkep pt-6">
                {pkg.features.map((item) => (
                  <li key={item} className="flex gap-3">
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1.5 h-4 w-4 shrink-0"><path d="M3 10.5l4.5 4.5L17 5" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-auto pt-8">
              <ContactPair surface={pkg.featured ? "yellow" : "light"} size="md" message={packageWaMessage(pkg.name)} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
