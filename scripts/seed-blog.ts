import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

// npm run db:seed-blog : başlangıç blog yazılarını ekler. Aynı adresli yazı varsa dokunmaz (yönetimden
// düzenlenmiş yazıların ezilmemesi için).
async function main() {
  const { db, schema } = await import("../lib/db");
  const { seedPosts } = await import("./blog-posts");

  let added = 0;
  for (const p of seedPosts) {
    const rows = await db
      .insert(schema.posts)
      .values({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        body: p.body,
        published: true,
        publishedAt: new Date(Date.now() - p.daysAgo * 86400000),
      })
      .onConflictDoNothing({ target: schema.posts.slug })
      .returning({ id: schema.posts.id });
    added += rows.length;
  }
  console.log(`Blog seed tamam. Eklenen yazı: ${added}/${seedPosts.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
