import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import { after, test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { fillTemplate, generateCommitmentPdf, loadTemplate, type CommitmentFields } from "../lib/commitment-pdf";
import { readStoredFile, removeFile, saveFile } from "../lib/storage";
import { MAX_UPLOAD_BYTES, sniffFileKind, storeUpload } from "../lib/uploads";
import { emptyOnboarding, parseOnboardingForm, validateForSubmit } from "../lib/validation/onboarding";

const fields: CommitmentFields = {
  legal_name: "Çığdem Şahin Ğüneş İnşaat Ltd. Şti.",
  tax_office: "Kadıköy",
  tax_number: "1234567890",
  address: "Örnek Mah. İstiklâl Cad. No:12 Daire:3",
  city: "İstanbul",
  contact_name: "Ayşe Yılmaz",
  package_name: "Kurumsal Web Sitesi + Google Ads Yönetimi",
  monthly_price: "3.000 TL",
  commitment_months: "12",
  provider_details: "Kaşif Yazılım Test A.Ş.",
};

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

after(() => rm(path.resolve(process.cwd(), ".uploads", "companies", "00000000-0000-0000-0000-000000000000"), { recursive: true, force: true }));

test("şablon: tüm alanlar dolar, bilinmeyen alan hata verir", async () => {
  const filled = fillTemplate(await loadTemplate(), fields);
  assert.ok(filled.includes("Çığdem Şahin Ğüneş İnşaat Ltd. Şti."));
  assert.ok(!/\{\{\w+\}\}/.test(filled));
  assert.throws(() => fillTemplate("{{yok_boyle_alan}}", fields), /bilinmeyen alan/);
});

test("PDF: Türkçe karakterli içerikle geçerli, çok sayfalı olmayan bir belge üretir", async () => {
  const bytes = await generateCommitmentPdf(fields, new Date("2026-10-23T09:00:00Z"));
  assert.equal(Buffer.from(bytes.slice(0, 5)).toString(), "%PDF-");
  const doc = await PDFDocument.load(bytes);
  assert.ok(doc.getPageCount() >= 1 && doc.getPageCount() <= 3);
  assert.equal(doc.getTitle(), "Taahhütname");
});

test("PDF: tek parça çok uzun metin satır kırma ile taşmadan üretilir", async () => {
  const bytes = await generateCommitmentPdf({ ...fields, address: "x".repeat(400), legal_name: "Ş".repeat(150) }, new Date());
  assert.ok((await PDFDocument.load(bytes)).getPageCount() >= 1);
});

test("dosya türü: içeriğe bakar, uzantıya değil", () => {
  assert.equal(sniffFileKind(PDF), "pdf");
  assert.equal(sniffFileKind(PNG), "png");
  assert.equal(sniffFileKind(JPG), "jpg");
  assert.equal(sniffFileKind(WEBP), "webp");
  assert.equal(sniffFileKind(new TextEncoder().encode("<svg onload=alert(1)>")), null);
  assert.equal(sniffFileKind(new TextEncoder().encode("MZ executable")), null);
});

const CID = "00000000-0000-0000-0000-000000000000";
const asFile = (bytes: Uint8Array, name: string) => new File([bytes as BlobPart], name);

test("yükleme: izinli tür kabul, sahte uzantı ve izinsiz tür red, boyut sınırı", async () => {
  const ok = await storeUpload({ companyId: CID, folder: "test", file: asFile(PDF, "imzali.pdf"), allowed: ["pdf"] });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.match(ok.file.path, new RegExp(`^companies/${CID}/test/[0-9a-f-]{36}\\.pdf$`));
    await removeFile(ok.file.path);
  }
  const fake = await storeUpload({ companyId: CID, folder: "test", file: asFile(new TextEncoder().encode("<script>x</script>"), "resim.png"), allowed: ["png"] });
  assert.equal(fake.ok, false);
  const wrongKind = await storeUpload({ companyId: CID, folder: "test", file: asFile(PDF, "a.pdf"), allowed: ["jpg", "png"] });
  assert.equal(wrongKind.ok, false);
  const big = new Uint8Array(MAX_UPLOAD_BYTES + 1);
  big.set(PDF);
  assert.equal((await storeUpload({ companyId: CID, folder: "test", file: asFile(big, "b.pdf"), allowed: ["pdf"] })).ok, false);
  assert.equal((await storeUpload({ companyId: CID, folder: "test", file: "yok", allowed: ["pdf"] })).ok, false);
});

test("yükleme: dosya adı yola karışmaz", async () => {
  const r = await storeUpload({ companyId: CID, folder: "test", file: asFile(PNG, "../../etc/passwd.png"), allowed: ["png"] });
  assert.ok(r.ok);
  if (r.ok) {
    assert.ok(!r.file.path.includes(".."));
    assert.ok(!r.file.name.includes("/"));
    await removeFile(r.file.path);
  }
});

test("depolama (yerel): yaz, oku, sil; dizin dışına çıkış reddedilir", async () => {
  const p = `companies/${CID}/test/roundtrip.pdf`;
  await saveFile(p, PDF, "application/pdf");
  const got = await readStoredFile(p);
  assert.ok(got);
  assert.equal(got!.contentType, "application/pdf");
  assert.equal(got!.size, PDF.length);
  await removeFile(p);
  assert.equal(await readStoredFile(p), null);
  await assert.rejects(() => saveFile("../../kacis.txt", PDF, "text/plain"), /Geçersiz dosya yolu/);
  await assert.rejects(() => readStoredFile("companies/../../../etc/passwd"), /Geçersiz dosya yolu/);
});

test("form: taslakta her şey boş olabilir, gönderimde zorunlu alanlar istenir", () => {
  const empty = emptyOnboarding();
  const errs = validateForSubmit(empty, false);
  assert.deepEqual(Object.keys(errs).sort(), ["alanAdi.hasDomain", "firma.offering", "firma.region", "firma.sector", "icerik.copyMode"]);
  const adsErrs = validateForSubmit(empty, true);
  assert.ok("reklam.monthlyBudgetKurus" in adsErrs && "reklam.goals" in adsErrs && "reklam.hasAccount" in adsErrs);
});

test("form: alan adı varsa detaylar, 'ben göndereceğim' ise metin zorunlu", () => {
  const d = emptyOnboarding();
  d.firma = { sector: "x", offering: "y", region: "z", competitors: "", intro: "" };
  d.alanAdi.hasDomain = "evet";
  d.icerik.copyMode = "ben";
  const e = validateForSubmit(d, false);
  assert.deepEqual(Object.keys(e).sort(), ["alanAdi.domainName", "alanAdi.dnsAccess", "alanAdi.registeredTo", "icerik.contentText"].sort());
  d.alanAdi.hasDomain = "hayir";
  d.icerik.copyMode = "siz";
  assert.deepEqual(validateForSubmit(d, false), {});
});

test("form: FormData ayrıştırma, bütçe TL'den kuruşa çevrilir, bozuk dosya JSON'ı boş sayılır", () => {
  const fd = new FormData();
  fd.set("sector", "  Mobilya ");
  fd.set("budgetTL", "1.500 TL");
  fd.append("goals", "arama");
  fd.append("goals", "whatsapp");
  fd.set("logo", "{bozuk json");
  fd.set("photos", JSON.stringify([{ path: "companies/x/onboarding/a.png", name: "a.png", size: 10 }]));
  const r = parseOnboardingForm(fd);
  assert.ok("data" in r);
  if ("data" in r) {
    assert.equal(r.data.firma.sector, "Mobilya");
    assert.equal(r.data.reklam.monthlyBudgetKurus, 150000);
    assert.deepEqual(r.data.reklam.goals, ["arama", "whatsapp"]);
    assert.equal(r.data.marka.logo, null);
    assert.equal(r.data.icerik.photos.length, 1);
  }
  const bad = new FormData();
  bad.append("goals", "baska");
  assert.ok("error" in parseOnboardingForm(bad));
});
