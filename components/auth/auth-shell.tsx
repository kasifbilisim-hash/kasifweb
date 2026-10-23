import type { ReactNode } from "react";

export function AuthShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-14 md:grid-cols-[1fr_1.1fr] md:pt-20">
      <div>
        <h1 className="display text-4xl text-emaye sm:text-5xl">{title}</h1>
        {lead ? <p className="mt-5 max-w-md text-xl">{lead}</p> : null}
      </div>
      <div className="border-4 border-murekkep bg-beyaz p-6 md:p-8">{children}</div>
    </section>
  );
}

export const inputClass =
  "mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 text-lg focus-visible:outline-tabela";

export const submitClass =
  "ui bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep disabled:opacity-60";
