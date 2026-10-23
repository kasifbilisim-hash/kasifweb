import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { EditPostForm } from "../post-form";

export const metadata: Metadata = { title: "Yazıyı düzenle", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default function YaziPage({ params }: PageProps<"/yonetim/blog/[id]">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  if (!UUID.test(id)) notFound();
  const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
  if (!post) notFound();

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <p><Link href="/yonetim/blog" className="underline underline-offset-4">Blog yazıları</Link></p>
      <h1 className="display mt-4 text-4xl text-emaye sm:text-5xl">Yazıyı düzenle</h1>
      {post.published ? (
        <p className="mb-8 mt-3"><Link href={`/blog/${post.slug}`} target="_blank" rel="noopener" className="underline underline-offset-4">Sitede gör</Link></p>
      ) : (
        <p className="mb-8 mt-3 text-soluk">Taslak: sitede görünmez.</p>
      )}
      <EditPostForm
        id={post.id}
        values={{ title: post.title, slug: post.slug, excerpt: post.excerpt, category: post.category, body: post.body, published: post.published }}
      />
    </section>
  );
}
