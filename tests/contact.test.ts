import assert from "node:assert/strict";
import { test } from "node:test";
import { getContact, normalizePhone, packageWaMessage } from "../lib/contact";

test("telefon: farklı yazımlar aynı uluslararası numaraya çevrilir", () => {
  for (const v of ["+90 549 100 34 27", "0 549 100 34 27", "0549 100 3427", "549 100 34 27", "00905491003427", "(0549) 100-34-27", "905491003427"]) {
    assert.equal(normalizePhone(v), "905491003427", v);
  }
  assert.equal(normalizePhone("+44 7700 900123"), "447700900123", "yabancı numara korunur");
  for (const bad of ["", "abc", "123", "[İÇERİK: telefon]"]) assert.equal(normalizePhone(bad), null, bad);
});

test("bağlantılar: sitedeki numaradan tel: ve wa.me üretilir, mesaj kodlanır", () => {
  const c = getContact();
  assert.equal(c.tel, "tel:+905491003427");
  assert.equal(c.wa(), "https://wa.me/905491003427");
  const url = c.wa(packageWaMessage('Kurumsal Web Sitesi + "Ads"'))!;
  assert.ok(url.startsWith("https://wa.me/905491003427?text="));
  assert.equal(decodeURIComponent(url.split("?text=")[1]), 'Merhaba, "Kurumsal Web Sitesi + "Ads"" hakkında bilgi almak istiyorum.');
  assert.ok(!url.includes(" ") && !url.includes('"'), "boşluk ve tırnak kodlanmış olmalı");
});
