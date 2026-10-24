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
    <nav aria-label="Panel">
      <ul className="space-y-0.5">
        {LINKS.map((l) => {
          const current = l.href === "/panel" ? pathname === "/panel" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={current ? "page" : undefined} className="adm-link">
                <span>{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
