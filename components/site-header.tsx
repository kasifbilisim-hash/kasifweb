import Link from "next/link";
import { nav, services } from "@/lib/site";
import { Logo } from "./logo";

const linkClass = "ui rounded-sm px-3 py-2 text-[0.95rem] hover:bg-kagit hover:text-emaye";

export function SiteHeader() {
  const rest = nav.filter((n) => n.href !== "/hizmetler");
  return (
    <header className="sticky top-0 z-40 border-b border-cizgi bg-beyaz">
      {/* Üst şerit */}
      <div className="on-gece hidden bg-gece text-beyaz md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-1.5 text-sm">
          <p className="text-beyaz/85">Kurumsal web sitesi ve Google Ads yönetimi, abonelik ya da tek seferlik paketle</p>
          <p className="flex items-center gap-5">
            <Link href="/iletisim" className="hover:underline">İletişim</Link>
            <Link href="/giris" className="ui hover:underline">Müşteri girişi</Link>
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3">
        <Link href="/" aria-label="Kaşif Yazılım, ana sayfa">
          <Logo priority />
        </Link>

        {/* Masaüstü menü */}
        <nav aria-label="Ana menü" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            <li className="group relative">
              <Link href="/hizmetler" className={`${linkClass} inline-flex items-center gap-1`} aria-haspopup="true">
                Hizmetler
                <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" className="mt-0.5"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              </Link>
              <div className="invisible absolute left-0 top-full w-[26rem] pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="border border-cizgi bg-beyaz p-2 shadow-[0_12px_32px_rgb(10_35_25/0.14)]">
                  {services.map((s) => (
                    <li key={s.href}>
                      <Link href={s.href} className="block px-4 py-3 hover:bg-kagit">
                        <span className="ui block">{s.label}</span>
                        <span className="block text-sm text-soluk">{s.description}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-cizgi">
                    <Link href="/hizmetler" className="ui block px-4 py-3 text-emaye hover:bg-kagit">Tüm hizmetler</Link>
                  </li>
                </ul>
              </div>
            </li>
            {rest.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/giris" className="ui hidden text-[0.95rem] hover:text-emaye sm:inline lg:hidden">Giriş</Link>
          <Link href="/paketler" className="ui bg-tabela px-5 py-2.5 text-[0.95rem] text-murekkep hover:bg-murekkep hover:text-beyaz">
            Paketleri gör
          </Link>

          {/* Mobil menü: JavaScript gerektirmez */}
          <details className="group relative lg:hidden">
            <summary className="ui flex cursor-pointer list-none items-center gap-2 border-2 border-murekkep px-3 py-2 text-[0.95rem] [&::-webkit-details-marker]:hidden">
              Menü
              <svg aria-hidden="true" width="16" height="12" viewBox="0 0 16 12"><path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" strokeWidth="2" /></svg>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2.5rem))] border border-cizgi bg-beyaz p-3 shadow-[0_12px_32px_rgb(10_35_25/0.18)]">
              <p className="ui px-2 pb-1 text-sm text-soluk">Hizmetler</p>
              <ul className="mb-2">
                {services.map((s) => (
                  <li key={s.href}><Link href={s.href} className="block px-2 py-2 hover:bg-kagit">{s.label}</Link></li>
                ))}
              </ul>
              <ul className="border-t border-cizgi pt-2">
                {nav.map((item) => (
                  <li key={item.href}><Link href={item.href} className="ui block px-2 py-2 hover:bg-kagit">{item.label}</Link></li>
                ))}
                <li><Link href="/giris" className="ui block px-2 py-2 hover:bg-kagit">Müşteri girişi</Link></li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
