"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavBadges = { commitments: number; tickets: number; cancellations: number };

const GROUPS: { title: string; items: { href: string; label: string; badge?: keyof NavBadges }[] }[] = [
  { title: "Genel", items: [{ href: "/yonetim", label: "Gösterge" }] },
  {
    title: "Müşteri işleri",
    items: [
      { href: "/yonetim/musteriler", label: "Müşteriler" },
      { href: "/yonetim/taahhutnameler", label: "Taahhütnameler", badge: "commitments" },
      { href: "/yonetim/destek", label: "Destek talepleri", badge: "tickets" },
      { href: "/yonetim/iptal", label: "İptal talepleri", badge: "cancellations" },
    ],
  },
  {
    title: "İçerik",
    items: [
      { href: "/yonetim/blog", label: "Blog yazıları" },
      { href: "/yonetim/paketler", label: "Paketler" },
    ],
  },
  { title: "Sistem", items: [{ href: "/yonetim/denetim", label: "Denetim kaydı" }] },
];

export function AdminNav({ badges }: { badges: NavBadges }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Yönetim" className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="adm-group">{g.title}</p>
          <ul className="mt-1 space-y-0.5">
            {g.items.map((item) => {
              const current = item.href === "/yonetim" ? pathname === "/yonetim" : pathname.startsWith(item.href);
              const n = item.badge ? badges[item.badge] : 0;
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={current ? "page" : undefined} className="adm-link">
                    <span>{item.label}</span>
                    {n > 0 ? (
                      <span className="adm-badge">
                        {n}
                        <span className="sr-only"> bekleyen</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
