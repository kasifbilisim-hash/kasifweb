"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { postSchema } from "@/lib/validation/admin";

export type PostValues = { title: string; slug: string; excerpt: string; category: string; body: string; published: boolean };
export type PostState = { message?: string; errors?: Record<string, string>; values?: PostValues; version?: number };

function readForm(formData: FormData): PostValues {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    category: String(formData.get("category") ?? ""),
    body: String(formData.get("body") ?? ""),
    published: formData.get("published") === "on",
  };
}

function refresh(slug?: string) {
  revalidateTag("posts", "max");
  revalidatePath("/yonetim/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "yazi";
  for (let n = 2; ; n++) {
    const [taken] = await db.select({ id: schema.posts.id }).from(schema.posts).where(eq(schema.posts.slug, slug));
    if (!taken || taken.id === ignoreId) return slug;
    slug = `${base || "yazi"}-${n}`;
  }
}

function fail(issues: import("zod").ZodIssue[], values: PostValues): PostState {
  const errors: Record<string, string> = {};
  for (const i of issues) errors[String(i.path[0])] ??= i.message;
  return { errors, values, version: Date.now() };
}

export async function createPost(_prev: PostState, formData: FormData): Promise<PostState> {
  const admin = await requireAdmin();
  const raw = readForm(formData);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues, raw);
  const d = parsed.data;

  const slug = await uniqueSlug(d.slug || slugify(d.title));
  const [created] = await db
    .insert(schema.posts)
    .values({ slug, title: d.title, excerpt: d.excerpt, category: d.category, body: d.body, published: d.published, publishedAt: d.published ? new Date() : null, authorUserId: admin.id })
    .returning({ id: schema.posts.id });
  await writeAudit({ actorUserId: admin.id, action: "post.created", targetTable: "posts", targetId: created.id, details: { slug, published: d.published } });

  refresh(slug);
  redirect(`/yonetim/blog/${created.id}`);
}

export async function updatePost(postId: string, _prev: PostState, formData: FormData): Promise<PostState> {
  const admin = await requireAdmin();
  const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, postId));
  if (!post) return { message: "Yazı bulunamadı." };

  const raw = readForm(formData);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues, raw);
  const d = parsed.data;

  const slug = await uniqueSlug(d.slug || slugify(d.title), postId);
  // Yayın tarihi ilk yayınlanışta bir kez atanır; sonradan taslağa alınıp yeniden yayınlansa da korunur.
  const publishedAt = d.published ? (post.publishedAt ?? new Date()) : post.publishedAt;

  await db.update(schema.posts).set({ slug, title: d.title, excerpt: d.excerpt, category: d.category, body: d.body, published: d.published, publishedAt }).where(eq(schema.posts.id, postId));
  await writeAudit({
    actorUserId: admin.id,
    action: d.published !== post.published ? (d.published ? "post.published" : "post.unpublished") : "post.updated",
    targetTable: "posts",
    targetId: postId,
    details: { slug, from: { published: post.published, slug: post.slug }, to: { published: d.published, slug } },
  });

  refresh(slug);
  if (slug !== post.slug) revalidatePath(`/blog/${post.slug}`);
  return { message: "Kaydedildi.", values: { ...d, slug }, version: Date.now() };
}

export async function deletePost(postId: string): Promise<void> {
  const admin = await requireAdmin();
  const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, postId));
  if (!post) return;
  await db.delete(schema.posts).where(eq(schema.posts.id, postId));
  await writeAudit({ actorUserId: admin.id, action: "post.deleted", targetTable: "posts", targetId: postId, details: { slug: post.slug, title: post.title } });
  refresh(post.slug);
  redirect("/yonetim/blog");
}
