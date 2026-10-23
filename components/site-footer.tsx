import Link from "next/link";
import { footerPages, legalPages, services, site } from "@/lib/site";
import { Logo } from "./logo";

function Col({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="ui mb-4 text-tabela">{title}</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-beyaz/85 underline-offset-4 hover:text-beyaz hover:underline">{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="on-gece bg-gece text-beyaz">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-beyaz/80">
            Web sitenizi kurar, Google reklamınızı yönetiriz. Reklam bütçesi sizin, hizmet bedeli bizim. Alan adınız her zaman sizde kalır.
          </p>
          <Link href="/giris" className="ui mt-6 inline-block border border-beyaz/40 px-5 py-2.5 hover:bg-beyaz hover:text-gece">
            Müşteri girişi
          </Link>
        </div>
        <Col title="Hizmetler" items={services} />
        <Col title="Kaşif" items={footerPages} />
        <Col title="Yasal" items={legalPages} />
      </div>
      <div className="border-t border-beyaz/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-sm text-beyaz/70">
          <p>© {site.name}. Tüm hakları saklıdır.</p>
          <p>Ödemeler iyzico güvencesiyle alınır, kart bilgileriniz bizde saklanmaz.</p>
        </div>
      </div>
    </footer>
  );
}
