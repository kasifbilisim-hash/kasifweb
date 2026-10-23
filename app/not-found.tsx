import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 py-24">
          <h1 className="display text-5xl text-emaye sm:text-7xl">Bu sayfa yok.</h1>
          <p className="mt-6 max-w-xl text-xl">Adres yanlış yazılmış ya da sayfa kaldırılmış olabilir.</p>
          <Link href="/" className="ui mt-8 inline-block bg-emaye px-7 py-4 text-beyaz hover:bg-murekkep">
            Ana sayfaya dön
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
