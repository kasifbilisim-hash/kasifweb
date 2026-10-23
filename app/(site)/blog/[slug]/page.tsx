import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { CtaBand } from "@/components/sections";
import { formatPostDate, getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/blog";
import { jsonLdString } from "@/lib/jsonld";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  // Yazı yoksa boş dizi döner; cacheComponents altında en az bir parametre gerekebileceği için ilk derlemede örnek kullanılmaz.
  // Cache Components en az bir sonuç ister. Blog kapalıyken ya da yazı yokken yer tutucu verilir; sayfa 404 döner.
  return posts.length > 0 ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "yazi-yok" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.publishedAt.toISOString(), modifiedTime: post.updatedAt.toISOString() },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
  };

  return (
    <>
      <article>
        <header className="border-b border-cizgi bg-kagit">
          <div className="mx-auto max-w-3xl px-5 pb-12 pt-14 md:pt-20">
            <p className="text-sm"><Link href="/blog" className="underline underline-offset-4">Blog</Link> <span className="text-soluk">/ {post.category}</span></p>
            <h1 className="display mt-4 text-4xl text-emaye sm:text-5xl">{post.title}</h1>
            <p className="mt-6 text-xl text-murekkep/90">{post.excerpt}</p>
            <p className="mt-5 text-sm text-soluk">{formatPostDate(post.publishedAt)} · {post.readingMinutes} dk okuma</p>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-5 py-14">
          {/* Markdown ham HTML'e izin vermez: yönetimden girilen metin güvenle gösterilir. */}
          <div className="metin">
            <Markdown>{post.body}</Markdown>
          </div>
          <aside className="mt-14 border-l-4 border-tabela bg-tabela-acik p-6">
            <p className="ui text-lg">Siteniz ve reklamınız için yardım ister misiniz?</p>
            <p className="mt-2">Paketlerimizi ve koşulları inceleyin ya da sorunuzu yazın.</p>
            <p className="mt-4 flex flex-wrap gap-5">
              <Link href="/paketler" className="ui underline underline-offset-4">Paketler</Link>
              <Link href="/iletisim" className="ui underline underline-offset-4">Bize yazın</Link>
            </p>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-cizgi bg-kagit">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 className="display text-2xl text-emaye">Diğer yazılar</h2>
            <ul className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group block h-full border border-cizgi bg-beyaz p-5 hover:border-emaye">
                    <p className="ui text-sm text-emaye">{p.category}</p>
                    <p className="ui mt-2 text-lg leading-snug group-hover:underline group-hover:underline-offset-4">{p.title}</p>
                    <p className="mt-3 text-sm text-soluk">{p.readingMinutes} dk okuma</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <CtaBand />
    </>
  );
}
