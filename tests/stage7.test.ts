import assert from "node:assert/strict";
import { test } from "node:test";
import { checkStageChange } from "../lib/stage-rules";
import { packageSchema, parsePriceTL, reasonSchema, stageChangeSchema } from "../lib/validation/admin";

test("fiyat: TL girdisi kuruşa çevrilir, boş = belirlenmedi, bozuk girdi reddedilir", () => {
  assert.equal(parsePriceTL("3000"), 300000);
  assert.equal(parsePriceTL("3.000"), 300000);
  assert.equal(parsePriceTL("3.000,50"), 300050);
  assert.equal(parsePriceTL("1500,5"), 150050);
  assert.equal(parsePriceTL(" 2.499 TL "), 249900);
  assert.equal(parsePriceTL(""), null);
  for (const bad of ["abc", "-5", "0", "12,345", "1.5.5", "999999999"]) assert.equal(parsePriceTL(bad), "invalid", bad);
});

test("paket formu: fiyat hatası mesajla döner", () => {
  const ok = packageSchema.parse({ name: "Paket", description: "", features: "Madde bir\n\n  Madde iki  \n", price: "3.000", sortOrder: "", active: true, featured: false, includesAds: false, domainFeeExtra: true, domainFee: "", billingType: "subscription" });
  assert.equal(ok.price, 300000);
  assert.deepEqual(ok.features, ["Madde bir", "Madde iki"]);
  assert.equal(ok.sortOrder, 0);
  const bad = packageSchema.safeParse({ name: "Paket", description: "", features: "", price: "abc", sortOrder: "1", active: true, featured: false, includesAds: false, domainFeeExtra: true, domainFee: "", billingType: "subscription" });
  assert.ok(!bad.success && bad.error.issues[0].path[0] === "price");
  assert.ok(!packageSchema.safeParse({ name: "ab", description: "", features: "", price: "", sortOrder: "1", active: true, featured: false, includesAds: false, domainFeeExtra: true, domainFee: "", billingType: "one_time" }).success);
});

test("aşama kuralları: taahhütname onaysız tasarım ve sonrası yok, önizleme olmadan onay istenemez", () => {
  assert.match(checkStageChange({ to: "tasarim", commitmentApproved: false, previewUrl: null })!, /Taahhütname onaylanmadan/);
  assert.match(checkStageChange({ to: "yayinda", commitmentApproved: false, previewUrl: null })!, /Taahhütname onaylanmadan/);
  assert.equal(checkStageChange({ to: "taahhutname_bekleniyor", commitmentApproved: false, previewUrl: null }), null);
  assert.match(checkStageChange({ to: "musteri_onayi", commitmentApproved: true, previewUrl: null })!, /önizleme/);
  assert.equal(checkStageChange({ to: "musteri_onayi", commitmentApproved: true, previewUrl: "https://x.test" }), null);
  assert.equal(checkStageChange({ to: "gelistirme", commitmentApproved: true, previewUrl: null }), null);
});

test("aşama formu: önizleme yalnızca http(s), boş = null; neden en az 5 karakter", () => {
  const base = { stage: "tasarim", description: "", notes: "" };
  assert.equal(stageChangeSchema.parse({ ...base, previewUrl: "" }).previewUrl, null);
  assert.equal(stageChangeSchema.parse({ ...base, previewUrl: "https://onizleme.example.com/a" }).previewUrl, "https://onizleme.example.com/a");
  for (const bad of ["javascript:alert(1)", "ftp://x.test", "not a url", "data:text/html,x"]) {
    assert.ok(!stageChangeSchema.safeParse({ ...base, previewUrl: bad }).success, bad);
  }
  assert.ok(!stageChangeSchema.safeParse({ ...base, stage: "sonlandirildi", previewUrl: "" }).success);
  assert.ok(!reasonSchema.safeParse({ reason: "kısa" }).success);
  assert.ok(reasonSchema.safeParse({ reason: "Belgede kaşe yok." }).success);
});
