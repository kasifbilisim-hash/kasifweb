import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHead } from "@/components/page-head";
import { CtaBand } from "@/components/sections";
import { formatPostDate, getPublishedPosts, type PostSummary } from "@/lib/blog";
import { features } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: "Kurumsal web sitesi, Google Ads ve dijital görünürlük hakkında işinize yarayacak yazılar.",
  alternates: { canonical: "/blog" },
};

const TONES = ["bg-emaye text-beyaz", "bg-tabela text-murekkep", "bg-gece text-beyaz", "bg-kagit text-emaye"];

function Cover({ post, index, large = false }: { post: PostSummary; index: number; large?: boolean }) {
  return (
    <div aria-hidden="true" className={`flex flex-col justify-between border-b border-cizgi p-5 ${TONES[index % TONES.length]} ${large ? "min-h-64" : "min-h-32"}`}>
      <span className="ui text-sm opacity-90">{post.category}</span>
      <span className={`display ${large ? "text-5xl" : "text-3xl"} opacity-90`}>{post.title.slice(0, 1)}</span>
    </div>
  );
}

export default async function BlogPage() {
  if (!features.blog) notFound();
  const posts = await getPublishedPosts();
  const [first, ...rest] = posts;
  return (
    <>
      <PageHead eyebrow="Blog" title="Web sitesi ve Google Ads üzerine" lead="Karar vermenize yardımcı olacak, abartısız ve uygulanabilir yazılar." />
      <section className="mx-auto max-w-6xl px-5 py-16">
        {!first ? (
          <p className="text-xl">Yazılar yakında burada.</p>
        ) : (
          <>
            <Link href={`/blog/${first.slug}`} className="group grid overflow-hidden border border-cizgi bg-beyaz hover:border-emaye md:grid-cols-[1fr_1.2fr]">
              <Cover post={first} index={0} large />
              <div className="p-8 md:p-10">
                <p className="ui text-sm text-soluk">{formatPostDate(first.publishedAt)} · {first.readingMinutes} dk okuma</p>
                <h2 className="display mt-3 text-3xl text-emaye group-hover:underline group-hover:underline-offset-4">{first.title}</h2>
                <p className="mt-4 text-lg">{first.excerpt}</p>
                <span className="ui mt-6 inline-block text-emaye">Yazıyı oku</span>
              </div>
            </Link>
            {rest.length > 0 && (
              <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col overflow-hidden border border-cizgi bg-beyaz hover:border-emaye">
                      <Cover post={p} index={i + 1} />
                      <div className="flex flex-1 flex-col p-6">
                        <h2 className="ui text-xl leading-snug group-hover:underline group-hover:underline-offset-4">{p.title}</h2>
                        <p className="mt-3 text-soluk">{p.excerpt}</p>
                        <p className="mt-auto pt-5 text-sm text-soluk">{formatPostDate(p.publishedAt)} · {p.readingMinutes} dk okuma</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
      <CtaBand />
    </>
  );
}
