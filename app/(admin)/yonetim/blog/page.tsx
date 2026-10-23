import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { features } from "@/lib/site";

export const metadata: Metadata = { title: "Blog yazıları", robots: { index: false } };

export default function BlogAdminPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const rows = await db
    .select({ id: schema.posts.id, slug: schema.posts.slug, title: schema.posts.title, category: schema.posts.category, published: schema.posts.published, publishedAt: schema.posts.publishedAt, updatedAt: schema.posts.updatedAt })
    .from(schema.posts)
    .orderBy(desc(schema.posts.updatedAt));

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Blog yazıları</h1>
        <Link href="/yonetim/blog/yeni" className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep">Yeni yazı</Link>
      </div>
      {!features.blog ? (
        <p className="mt-6 max-w-2xl border-l-4 border-tabela bg-tabela-acik px-4 py-3">
          Blog şu an sitede <strong>kapalı</strong>: yazılar burada durur ama ziyaretçiler göremez. Açmak için <code>lib/site.ts</code> içinde <code>features.blog</code> değerini <code>true</code> yapın.
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p className="mt-10 text-xl">Henüz yazı yok.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-y-2 border-murekkep text-left">
            <caption className="sr-only">Blog yazıları</caption>
            <thead>
              <tr className="border-b-2 border-murekkep">
                <th scope="col" className="ui py-3 pr-4">Başlık</th>
                <th scope="col" className="ui py-3 pr-4">Kategori</th>
                <th scope="col" className="ui py-3 pr-4">Durum</th>
                <th scope="col" className="ui py-3">Güncelleme</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-murekkep">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-4">
                    <Link href={`/yonetim/blog/${r.id}`} className="underline underline-offset-4">{r.title}</Link>
                  </td>
                  <td className="py-3 pr-4">{r.category}</td>
                  <td className="py-3 pr-4">
                    {r.published ? (
                      <Link href={`/blog/${r.slug}`} target="_blank" rel="noopener" className="text-emaye underline underline-offset-4">Yayında{r.publishedAt ? ` (${formatDate(r.publishedAt)})` : ""}</Link>
                    ) : (
                      <span className="text-soluk">Taslak</span>
                    )}
                  </td>
                  <td className="py-3">{formatDate(r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
