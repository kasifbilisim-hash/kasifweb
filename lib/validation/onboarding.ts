import { z } from "zod";

export const fileRefSchema = z.object({
  path: z.string().min(1).max(300),
  name: z.string().max(150),
  size: z.number().int().nonnegative(),
});
export type FileRef = z.infer<typeof fileRefSchema>;

const text = (max: number) => z.string().trim().max(max).default("");
const yesNo = z.enum(["evet", "hayir", ""]).default("");

export const STEPS = ["firma", "marka", "icerik", "alanAdi", "reklam"] as const;
export type Step = (typeof STEPS)[number];

export const STEP_LABELS: Record<Step, string> = {
  firma: "Firma",
  marka: "Marka",
  icerik: "İçerik",
  alanAdi: "Alan adı",
  reklam: "Google Ads",
};

/** Taslakta her alan boş olabilir; yalnızca tür ve uzunluk sınırları denetlenir. */
export const onboardingDataSchema = z.object({
  firma: z.object({
    sector: text(200),
    offering: text(2000),
    region: text(300),
    competitors: text(1000),
    intro: text(3000),
  }),
  marka: z.object({
    colors: text(300),
    likedSites: text(1000),
    logo: fileRefSchema.nullable().default(null),
  }),
  icerik: z.object({
    pages: text(1000),
    copyMode: z.enum(["ben", "siz", ""]).default(""),
    contentText: text(8000),
    photos: z.array(fileRefSchema).max(10).default([]),
  }),
  alanAdi: z.object({
    hasDomain: yesNo,
    domainName: text(253),
    registeredTo: z.enum(["firma", "baska", "bilmiyorum", ""]).default(""),
    dnsAccess: z.enum(["var", "yok", "bilmiyorum", ""]).default(""),
  }),
  reklam: z.object({
    hasAccount: yesNo,
    monthlyBudgetKurus: z.number().int().min(0).max(100_000_000).nullable().default(null),
    goals: z.array(z.enum(["arama", "form", "whatsapp"])).default([]),
    regions: text(500),
  }),
});

export type OnboardingData = z.infer<typeof onboardingDataSchema>;

export const emptyOnboarding = (): OnboardingData => onboardingDataSchema.parse({
  firma: {}, marka: {}, icerik: {}, alanAdi: {}, reklam: {},
});

export type SubmitErrors = Partial<Record<string, string>>;

/** Gönderirken zorunlu alanlar. Anahtar "adım.alan" biçimindedir. */
export function validateForSubmit(data: OnboardingData, hasAds: boolean): SubmitErrors {
  const e: SubmitErrors = {};
  const need = (key: string, value: string, msg: string) => {
    if (!value.trim()) e[key] = msg;
  };
  need("firma.sector", data.firma.sector, "Sektörünüzü yazın.");
  need("firma.offering", data.firma.offering, "Hizmet veya ürünlerinizi yazın.");
  need("firma.region", data.firma.region, "Hedef bölgeyi yazın.");

  if (!data.icerik.copyMode) e["icerik.copyMode"] = "Metinleri kimin yazacağını seçin.";
  if (data.icerik.copyMode === "ben") need("icerik.contentText", data.icerik.contentText, "Metinlerinizi yazın ya da \"Siz yazın\" seçin.");

  if (!data.alanAdi.hasDomain) e["alanAdi.hasDomain"] = "Alan adınız olup olmadığını seçin.";
  if (data.alanAdi.hasDomain === "evet") {
    need("alanAdi.domainName", data.alanAdi.domainName, "Alan adını yazın.");
    if (!data.alanAdi.registeredTo) e["alanAdi.registeredTo"] = "Alan adının kimin adına kayıtlı olduğunu seçin.";
    if (!data.alanAdi.dnsAccess) e["alanAdi.dnsAccess"] = "DNS erişiminiz olup olmadığını seçin.";
  }

  if (hasAds) {
    if (!data.reklam.hasAccount) e["reklam.hasAccount"] = "Google Ads hesabınız olup olmadığını seçin.";
    if (data.reklam.monthlyBudgetKurus === null || data.reklam.monthlyBudgetKurus <= 0) {
      e["reklam.monthlyBudgetKurus"] = "Hedef aylık bütçeyi TL olarak yazın.";
    }
    if (data.reklam.goals.length === 0) e["reklam.goals"] = "En az bir hedef seçin.";
    need("reklam.regions", data.reklam.regions, "Reklam bölgesini yazın.");
  }
  return e;
}

export const stepOfKey = (key: string): Step => key.split(".")[0] as Step;

/** FormData → OnboardingData. Dosya alanları JSON string olarak gelir; bozuksa boş sayılır. */
export function parseOnboardingForm(fd: FormData): { data: OnboardingData } | { error: string } {
  const s = (k: string) => String(fd.get(k) ?? "");
  const json = (k: string): unknown => {
    try {
      return JSON.parse(s(k) || "null");
    } catch {
      return null;
    }
  };
  const budgetRaw = s("budgetTL").replace(/[^\d]/g, "");
  const parsed = onboardingDataSchema.safeParse({
    firma: { sector: s("sector"), offering: s("offering"), region: s("region"), competitors: s("competitors"), intro: s("intro") },
    marka: { colors: s("colors"), likedSites: s("likedSites"), logo: json("logo") },
    icerik: { pages: s("pages"), copyMode: s("copyMode"), contentText: s("contentText"), photos: json("photos") ?? [] },
    alanAdi: { hasDomain: s("hasDomain"), domainName: s("domainName"), registeredTo: s("registeredTo"), dnsAccess: s("dnsAccess") },
    reklam: {
      hasAccount: s("hasAdsAccount"),
      monthlyBudgetKurus: budgetRaw ? Number(budgetRaw) * 100 : null,
      goals: fd.getAll("goals").map(String),
      regions: s("adsRegions"),
    },
  });
  return parsed.success ? { data: parsed.data } : { error: "Form bilgileri geçersiz. Sayfayı yenileyip tekrar deneyin." };
}
