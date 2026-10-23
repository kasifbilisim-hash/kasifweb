import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

// Kullanım: npm run db:make-admin -- kisi@ornek.com
// Önce o e-postayla /kayit üzerinden hesap açılmış olmalı. Admin yetkisi yalnızca buradan verilir.
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("E-posta verin: npm run db:make-admin -- kisi@ornek.com");

  const { db, schema } = await import("../lib/db");
  const { eq } = await import("drizzle-orm");

  const [updated] = await db
    .update(schema.user)
    .set({ role: "admin" })
    .where(eq(schema.user.email, email))
    .returning({ id: schema.user.id });
  if (!updated) throw new Error(`${email} ile kayıtlı kullanıcı bulunamadı.`);

  await db.insert(schema.auditLog).values({
    actorUserId: null,
    action: "user.make_admin",
    targetTable: "user",
    targetId: updated.id,
    details: { via: "scripts/make-admin.ts" },
  });
  console.log(`${email} artık admin.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
