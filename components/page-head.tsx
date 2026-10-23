import type { ReactNode } from "react";

/** Alt sayfa başlığı: kâğıt zeminli şerit, ekmek kırıntısı ve geniş başlık. */
export function PageHead({ title, lead, eyebrow, children }: { title: string; lead?: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-cizgi bg-kagit">
      <div className="mx-auto max-w-6xl px-5 pb-14 pt-14 md:pt-20">
        {eyebrow ? <p className="ui text-sm text-soluk">{eyebrow}</p> : null}
        <h1 className="display mt-2 max-w-4xl text-4xl text-emaye sm:text-6xl">{title}</h1>
        {lead ? <p className="mt-6 max-w-2xl text-xl text-murekkep/90">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}
