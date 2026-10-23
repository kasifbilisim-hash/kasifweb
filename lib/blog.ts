import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { features } from "@/lib/site";

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: Date;
  readingMinutes: number;
};

export type Post = PostSummary & { body: string; updatedAt: Date };

/** Dakikada ~200 kelime. */
export function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const summaryCols = {
  slug: schema.posts.slug,
  title: schema.posts.title,
  excerpt: schema.posts.excerpt,
  category: schema.posts.category,
  publishedAt: schema.posts.publishedAt,
  body: schema.posts.body,
};

type Row = { slug: string; title: string; excerpt: string; category: string; publishedAt: Date | null; body: string };

const toSummary = (r: Row): PostSummary => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  category: r.category,
  publishedAt: r.publishedAt ?? new Date(0),
  readingMinutes: readingMinutes(r.body),
});

type Full = Row & { updatedAt: Date };

/**
 * Yayındaki tüm yazılar tek bir önbellek kaydında (yeniden eskiye). Tek tek adresler veritabanına sorulmaz:
 * girişsiz biri rastgele adres isteyerek ne sorgu ne önbellek kaydı çoğaltabilir. Yönetimde değişiklik
 * olunca "posts" etiketi temizlenir.
 */
async function loadPublished(): Promise<Full[]> {
  "use cache";
  if (!features.blog) return [];
  cacheTag("posts");
  cacheLife("hours");
  return db
    .select({ ...summaryCols, updatedAt: schema.posts.updatedAt })
    .from(schema.posts)
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.publishedAt));
}

export async function getPublishedPosts(limit?: number): Promise<PostSummary[]> {
  const all = await loadPublished();
  return (limit ? all.slice(0, limit) : all).map(toSummary);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const r = (await loadPublished()).find((p) => p.slug === slug);
  return r ? { ...toSummary(r), body: r.body, updatedAt: r.updatedAt } : null;
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<PostSummary[]> {
  return (await loadPublished()).filter((p) => p.slug !== slug).slice(0, limit).map(toSummary);
}

const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" });
export const formatPostDate = (d: Date) => dateFmt.format(d);
