import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateNextPayment } from "../lib/billing";
import { cancelSchema, firstErrors, newTicketSchema, revisionSchema, ticketReplySchema } from "../lib/validation/panel";

const d = (s: string) => new Date(s);

test("sonraki ödeme: başlangıç + başarılı ödeme sayısı ay, taahhüt bitişinde null", () => {
  const startedAt = d("2026-01-31T09:00:00Z");
  const commitmentEndsAt = d("2027-01-31T09:00:00Z");
  assert.equal(estimateNextPayment({ startedAt, commitmentEndsAt, successfulPayments: 1 })?.toISOString(), "2026-02-28T09:00:00.000Z");
  assert.equal(estimateNextPayment({ startedAt, commitmentEndsAt, successfulPayments: 11 })?.toISOString(), "2026-12-31T09:00:00.000Z");
  assert.equal(estimateNextPayment({ startedAt, commitmentEndsAt, successfulPayments: 12 }), null);
  assert.equal(estimateNextPayment({ startedAt: null, commitmentEndsAt, successfulPayments: 0 }), null);
});

test("talep: kategori listesi dışı (iptal dahil) ve boş alanlar reddedilir, boşluklar kırpılır", () => {
  assert.ok(newTicketSchema.safeParse({ category: "teknik", subject: "  Sayfa açılmıyor ", message: "Ana sayfa hata veriyor" }).success);
  assert.equal(newTicketSchema.parse({ category: "teknik", subject: "  Sayfa açılmıyor ", message: "Ana sayfa hata veriyor" }).subject, "Sayfa açılmıyor");
  const bad = newTicketSchema.safeParse({ category: "iptal", subject: "", message: "" });
  assert.ok(!bad.success);
  assert.deepEqual(Object.keys(firstErrors(bad.error)).sort(), ["category", "message", "subject"]);
  assert.ok(!ticketReplySchema.safeParse({ message: "   " }).success);
});

test("iptal nedeni ve revizyon notu zorunlu, üst sınır var", () => {
  assert.ok(!cancelSchema.safeParse({ reason: "kısa" }).success);
  assert.ok(cancelSchema.safeParse({ reason: "Beklediğim sonucu alamadım." }).success);
  assert.ok(!cancelSchema.safeParse({ reason: "x".repeat(2001) }).success);
  assert.ok(!revisionSchema.safeParse({ note: "" }).success);
  assert.ok(revisionSchema.safeParse({ note: "Logoyu büyütün" }).success);
});
