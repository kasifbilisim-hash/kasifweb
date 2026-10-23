import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { addMonthsUTC } from "../lib/dates";
import { buildAuthorization } from "../lib/iyzico/client";
import { computeWebhookSignature, verifyWebhookSignature, webhookPayloadSchema } from "../lib/iyzico/webhook";
import { safeNext } from "../lib/safe-next";
import { checkoutSchema, normalizeTrPhone } from "../lib/validation/checkout";

test("IYZWSv2: başlık biçimi ve imza dokümandaki algoritmaya uyar", () => {
  const args = { apiKey: "sandbox-key", secretKey: "sandbox-secret", randomKey: "1700000000000abc", path: "/v2/subscription/products", body: '{"name":"x"}' };
  const header = buildAuthorization(args);
  assert.match(header, /^IYZWSv2 [A-Za-z0-9+/=]+$/);

  const decoded = Buffer.from(header.slice("IYZWSv2 ".length), "base64").toString("utf8");
  const expectedSig = createHmac("sha256", args.secretKey)
    .update(args.randomKey + args.path + args.body)
    .digest("hex");
  assert.equal(decoded, `apiKey:${args.apiKey}&randomKey:${args.randomKey}&signature:${expectedSig}`);
});

test("IYZWSv2: gövde boşsa payload randomKey + path olur", () => {
  const a = { apiKey: "k", secretKey: "s", randomKey: "r1", path: "/p" };
  const decoded = Buffer.from(buildAuthorization({ ...a, body: "" }).slice(8), "base64").toString("utf8");
  assert.ok(decoded.endsWith("signature:" + createHmac("sha256", "s").update("r1/p").digest("hex")));
});

const payload = webhookPayloadSchema.parse({
  iyziEventType: "subscription.order.success",
  subscriptionReferenceCode: "sub-1",
  orderReferenceCode: "ord-1",
  customerReferenceCode: "cus-1",
});

test("webhook: doğru imza kabul edilir, büyük harfli hex de olur", () => {
  const sig = computeWebhookSignature(payload, "merchant", "secret");
  assert.equal(verifyWebhookSignature(payload, sig, "merchant", "secret"), true);
  assert.equal(verifyWebhookSignature(payload, sig.toUpperCase(), "merchant", "secret"), true);
});

test("webhook: başlık yok, yanlış imza ve değiştirilmiş alan reddedilir", () => {
  const sig = computeWebhookSignature(payload, "merchant", "secret");
  assert.equal(verifyWebhookSignature(payload, null, "merchant", "secret"), false);
  assert.equal(verifyWebhookSignature(payload, "deadbeef", "merchant", "secret"), false);
  assert.equal(verifyWebhookSignature({ ...payload, orderReferenceCode: "ord-2" }, sig, "merchant", "secret"), false);
  assert.equal(verifyWebhookSignature(payload, sig, "baska-merchant", "secret"), false);
  assert.equal(verifyWebhookSignature({ ...payload, iyziEventType: "subscription.order.failure" }, sig, "merchant", "secret"), false);
});

test("webhook: bilinmeyen olay türü şemada reddedilir", () => {
  assert.equal(webhookPayloadSchema.safeParse({ ...payload, iyziEventType: "baska.olay" }).success, false);
});

test("addMonthsUTC: 12 ay ve ay sonu taşması", () => {
  assert.equal(addMonthsUTC(new Date("2026-10-23T10:00:00Z"), 12).toISOString(), "2027-10-23T10:00:00.000Z");
  assert.equal(addMonthsUTC(new Date("2026-01-31T00:00:00Z"), 1).toISOString(), "2026-02-28T00:00:00.000Z");
  assert.equal(addMonthsUTC(new Date("2027-12-31T00:00:00Z"), 2).toISOString(), "2028-02-29T00:00:00.000Z");
});

test("normalizeTrPhone", () => {
  assert.equal(normalizeTrPhone("0555 123 45 67"), "+905551234567");
  assert.equal(normalizeTrPhone("+90 555 123 45 67"), "+905551234567");
  assert.equal(normalizeTrPhone("5551234567"), "+905551234567");
  assert.equal(normalizeTrPhone("02121234567"), null);
  assert.equal(normalizeTrPhone("123"), null);
});

test("safeNext: yalnızca site içi yol", () => {
  assert.equal(safeNext("/abonelik/web-ads"), "/abonelik/web-ads");
  assert.equal(safeNext("https://kotu.example"), "/panel");
  assert.equal(safeNext("//kotu.example"), "/panel");
  assert.equal(safeNext("/\\kotu.example"), "/panel");
  assert.equal(safeNext(null), "/panel");
});

test("checkout şeması: eksik onay ve geçersiz alanlar hata verir", () => {
  const ok = {
    slug: "web-ads", legalName: "Örnek Ltd. Şti.", taxOffice: "Kadıköy", taxNumber: "1234567890",
    address: "Örnek Mah. Deneme Sok. No:1", city: "İstanbul", contactName: "Ayşe Yılmaz",
    contactPhone: "05551234567", identityNumber: "12345678901",
    mesafeli_satis: "on", on_bilgilendirme: "on", kvkk: "on",
  };
  assert.equal(checkoutSchema.safeParse(ok).success, true);
  const bad = checkoutSchema.safeParse({ ...ok, kvkk: undefined, contactName: "Ayşe", taxNumber: "12" });
  assert.equal(bad.success, false);
  const fields = new Set(bad.error!.issues.map((i) => i.path[0]));
  assert.deepEqual([...fields].sort(), ["contactName", "kvkk", "taxNumber"]);
});
