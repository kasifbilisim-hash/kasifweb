import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { config } from "dotenv";
import { buildEmail } from "../lib/email/templates";

config({ path: ".env.local" });

const PAIRS: [("customer" | "admin"), string][] = [
  ["customer", "welcome"], ["customer", "payment_received"], ["customer", "payment_failed"],
  ["customer", "commitment_approved"], ["customer", "commitment_rejected"], ["customer", "project_stage_changed"],
  ["customer", "ticket_reply"], ["customer", "cancel_approved"], ["customer", "cancel_rejected"], ["customer", "invoice_ready"],
  ["admin", "onboarding_submitted"], ["admin", "commitment_uploaded"], ["admin", "ticket_created"], ["admin", "ticket_reply"],
  ["admin", "cancel_requested"], ["admin", "preview_approved"], ["admin", "revision_requested"], ["admin", "payment_failed"],
];

test("e-posta: koddaki her notify şablonunun içeriği var", () => {
  for (const [to, template] of PAIRS) {
    const c = buildEmail(to, template, { company: "Örnek Ltd.", data: { reason: "x", stage: "tasarim" } });
    assert.ok(c, `${to}/${template}`);
    assert.ok(c.subject && c.heading && c.paragraphs.length > 0, `${to}/${template} boş alan`);
  }
  assert.equal(buildEmail("customer", "yok", {}), null);

  // Kaynakta notify({to, template}) ile geçen her şablon tanımlı olmalı (şablon eklenip içeriği unutulmasın).
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      if (["node_modules", ".next", "tests", ".git"].includes(f)) continue;
      const p = path.join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(f)) files.push(p);
    }
  };
  walk(path.resolve("app"));
  walk(path.resolve("lib"));
  const found = new Set<string>();
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/notify\(\{[^}]*?to: "(customer|admin)"[^}]*?template: "(\w+)"/g)) found.add(`${m[1]}/${m[2]}`);
  }
  for (const key of found) {
    const [to, template] = key.split("/") as ["customer" | "admin", string];
    assert.ok(buildEmail(to, template, {}), `notify şablonu içeriksiz: ${key}`);
  }
  assert.ok(found.size >= 10, "taramada notify çağrıları bulunamadı");
});

test("e-posta: red ve iptal nedeni şablona olduğu gibi girer (kaçışlamayı React yapar), neden yoksa yer tutucu", () => {
  const c = buildEmail("customer", "commitment_rejected", { data: { reason: "Kaşe okunmuyor" } });
  assert.ok(c?.paragraphs[0].includes("Kaşe okunmuyor"));
  assert.ok(buildEmail("customer", "cancel_rejected", {})?.paragraphs[0].includes("[Neden belirtilmedi]"));
  assert.match(buildEmail("customer", "project_stage_changed", { data: { stage: "musteri_onayi" } })!.subject, /Müşteri onayı/);
  // Müşteri verisi (talep konusu, mesaj) yönetici e-postalarına hiç girmez, yalnızca firma adı girer.
  assert.ok(!JSON.stringify(buildEmail("admin", "ticket_created", { company: "Örnek Ltd.", data: { subject: "GİZLİ" } })).includes("GİZLİ"));
});

test("hız sınırı: sınıra kadar geçer, sonra engeller, anahtarlar birbirinden bağımsız, pencere dolunca sıfırlanır", { skip: !process.env.DATABASE_URL }, async () => {
  const { rateLimit } = await import("../lib/rate-limit");
  const k = `test-${Date.now()}`;
  const results = [];
  for (let i = 0; i < 4; i++) results.push(await rateLimit(k, 3, 60));
  assert.deepEqual(results.map((r) => r.ok), [true, true, true, false]);
  const blocked = results[3];
  assert.ok(!blocked.ok && blocked.retryAfterSeconds > 0 && blocked.retryAfterSeconds <= 60);
  assert.ok((await rateLimit(`${k}-baska`, 3, 60)).ok);
  // 1 saniyelik pencere: süre dolunca yeniden başlar
  const k2 = `${k}-kisa`;
  assert.ok((await rateLimit(k2, 1, 1)).ok);
  assert.ok(!(await rateLimit(k2, 1, 1)).ok);
  await new Promise((r) => setTimeout(r, 1200));
  assert.ok((await rateLimit(k2, 1, 1)).ok);
});

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { db } = await import("../lib/db");
  const { sql } = await import("drizzle-orm");
  await db.execute(sql`delete from rate_limit where key like 'rl:test-%'`);
});
