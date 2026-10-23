"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Bir şey ters gitti</h1>
      <p className="mt-6 max-w-xl text-xl">
        İşleminiz tamamlanmamış olabilir. Tekrar deneyin; sorun sürerse bize yazın, durumu kontrol edelim.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <button type="button" onClick={reset} className="ui bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep">
          Tekrar dene
        </button>
        <Link href="/iletisim" className="ui text-lg underline underline-offset-4">İletişim</Link>
      </div>
    </section>
  );
}
