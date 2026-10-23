"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/panel", label: "Özet" },
  { href: "/panel/proje", label: "Proje" },
  { href: "/panel/destek", label: "Destek" },
  { href: "/panel/odemeler", label: "Ödemeler" },
  { href: "/panel/firma", label: "Firma ve belgeler" },
];

export function PanelNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="border-b-2 border-murekkep bg-beyaz">
      <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-1 px-5">
        {LINKS.map((l) => {
          const current = l.href === "/panel" ? pathname === "/panel" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={`ui block border-b-4 py-3 ${current ? "border-tabela" : "border-transparent hover:border-murekkep"}`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
