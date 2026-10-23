import assert from "node:assert/strict";
import { test } from "node:test";
import { config } from "dotenv";
import { jsonLdString } from "../lib/jsonld";
import { safeNext } from "../lib/safe-next";
import { sniffFileKind } from "../lib/uploads";

config({ path: ".env.local" });

test("JSON-LD: </script> ile betikten çıkılamaz, JSON olarak aynı veri kalır", () => {
  const evil = { headline: '</script><img src=x onerror=alert(1)>', note: "a & b   c" };
  const out = jsonLdString(evil);
  assert.ok(!out.includes("</script>") && !out.includes("<") && !out.includes(">"));
  assert.deepEqual(JSON.parse(out), evil);
});

test("açık yönlendirme: yalnızca site içi mutlak yol", () => {
  for (const bad of ["https://kotu.example", "//kotu.example", "/\\kotu.example", "javascript:alert(1)", "panel", "", null, undefined]) {
    assert.equal(safeNext(bad as string | null | undefined, "/panel"), "/panel", String(bad));
  }
  assert.equal(safeNext("/abonelik/web-ads"), "/abonelik/web-ads");
});

test("yükleme: SVG, HTML ve çalıştırılabilir içerik türü olarak kabul edilmez", () => {
  const enc = new TextEncoder();
  for (const body of ["<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>", "<!doctype html><script>alert(1)</script>", "MZ\u0090\u0000\u0003", "#!/bin/sh\nrm -rf /", "GIF89a"]) {
    assert.equal(sniffFileKind(enc.encode(body)), null, body.slice(0, 20));
  }
  // PDF imzası taşıyan ama başka içerik: tür PDF sayılır (dosya yalnızca indirilir, tarayıcıda çalıştırılmaz)
  assert.equal(sniffFileKind(new Uint8Array([0x25, 0x50, 0x44, 0x46])), "pdf");
});

test("hız sınırı temizliği: eski sayaçlar silinir, taze olanlar kalır", { skip: !process.env.DATABASE_URL }, async () => {
  const { db } = await import("../lib/db");
  const { sql } = await import("drizzle-orm");
  const { purgeExpiredRateLimits } = await import("../lib/rate-limit");
  const tag = `test-purge-${Date.now()}`;
  const old = Date.now() - 5 * 24 * 3600 * 1000;
  await db.execute(sql`insert into rate_limit (id, key, count, last_request) values (${tag + "-a"}, ${"rl:" + tag + "-eski"}, 1, ${old}), (${tag + "-b"}, ${"rl:" + tag + "-taze"}, 1, ${Date.now()})`);
  const removed = await purgeExpiredRateLimits();
  assert.ok(removed >= 1);
  const left = await db.execute(sql`select key from rate_limit where key like ${"rl:" + tag + "%"}`);
  assert.deepEqual(left.rows.map((r) => (r as { key: string }).key), ["rl:" + tag + "-taze"]);
  await db.execute(sql`delete from rate_limit where key like ${"rl:" + tag + "%"}`);
});
