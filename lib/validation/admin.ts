import { z } from "zod";

const text = (min: number, max: number, empty: string) =>
  z.string().trim().min(min, empty).max(max, `En fazla ${max} karakter olabilir.`);

export const reasonSchema = z.object({ reason: text(5, 1000, "Nedeni yazın (en az 5 karakter).") });

export const adminReplySchema = z.object({ message: text(1, 5000, "Mesajı yazın.") });

export const STAGE_OPTIONS = [
  ["bilgi_bekleniyor", "Bilgi bekleniyor"],
  ["taahhutname_bekleniyor", "Taahhütname bekleniyor"],
  ["tasarim", "Tasarım"],
  ["musteri_onayi", "Müşteri onayı"],
  ["gelistirme", "Geliştirme"],
  ["yayinda", "Yayında"],
] as const;

export type ManualStage = (typeof STAGE_OPTIONS)[number][0];

/** Yalnızca http(s) adresi; boş bırakılırsa null. */
const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .transform((v) => (v === "" ? null : v))
  .refine((v) => {
    if (v === null) return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, "Geçerli bir http(s) adresi yazın.");

export const stageChangeSchema = z.object({
  stage: z.enum(STAGE_OPTIONS.map((s) => s[0]) as [ManualStage, ...ManualStage[]], { message: "Bir aşama seçin." }),
  description: z.string().trim().max(1000, "En fazla 1000 karakter olabilir."),
  notes: z.string().trim().max(3000, "En fazla 3000 karakter olabilir."),
  previewUrl: optionalHttpUrl,
});

/** "1.500", "1500,50" gibi TL girdisini kuruşa çevirir. Boş = null (fiyat belirlenmedi). */
export function parsePriceTL(input: string): number | null | "invalid" {
  const s = input.trim().replace(/\s|TL/gi, "");
  if (s === "") return null;
  // Binlik nokta + ondalık virgül (tr) ya da düz sayı
  const normalized = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return "invalid";
  const kurus = Math.round(Number(normalized) * 100);
  return kurus > 0 && kurus <= 100_000_000 ? kurus : "invalid";
}

/** Her satır bir madde. Boş satırlar atılır. */
export function parseFeatureLines(input: string): string[] {
  return input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export const packageSchema = z.object({
  name: text(3, 120, "Paket adını yazın."),
  description: z.string().trim().max(500, "Özet en fazla 500 karakter olabilir."),
  features: z.string().transform((v) => parseFeatureLines(v)).refine((l) => l.length <= 12, "En fazla 12 madde ekleyebilirsiniz.").refine((l) => l.every((x) => x.length <= 200), "Her madde en fazla 200 karakter olabilir."),
  price: z.string().transform((v, ctx) => {
    const r = parsePriceTL(v);
    if (r === "invalid") ctx.addIssue({ code: "custom", message: "Fiyatı TL olarak yazın, örnek: 3000 ya da 3.000,50. Boş bırakırsanız fiyat belirlenmemiş olur." });
    return r === "invalid" ? null : r;
  }),
  sortOrder: z.string().trim().transform((v, ctx) => {
    if (v === "") return 0;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 999) ctx.addIssue({ code: "custom", message: "Sıra 0 ile 999 arasında tam sayı olmalı." });
    return Number.isInteger(n) ? n : 0;
  }),
  active: z.boolean(),
  featured: z.boolean(),
  includesAds: z.boolean(),
  billingType: z.enum(["subscription", "one_time"], { message: "Ödeme biçimini seçin." }),
  domainFeeExtra: z.boolean(),
  domainFee: z.string().transform((v, ctx) => {
    const r = parsePriceTL(v);
    if (r === "invalid") ctx.addIssue({ code: "custom", message: "Alan adı ücretini TL olarak yazın, örnek: 400 ya da 450,50. Boş bırakırsanız tutar yazılmaz." });
    return r === "invalid" ? null : r;
  }),
});

export const postSchema = z.object({
  title: text(3, 150, "Başlığı yazın."),
  slug: z
    .string()
    .trim()
    .max(90)
    .refine((v) => v === "" || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v), "Adres yalnızca küçük harf, rakam ve tire içerebilir."),
  excerpt: z.string().trim().max(300, "Özet en fazla 300 karakter olabilir."),
  category: text(2, 40, "Kategori yazın."),
  body: z.string().max(60000, "Metin çok uzun."),
  published: z.boolean(),
});
