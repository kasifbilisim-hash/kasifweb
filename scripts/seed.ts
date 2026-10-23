import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

// Paketler yönetim panelinden değişir (fiyat, özet, madde listesi, yeni paket). Seed mevcut kayıtları
// ezmez; yalnızca eksik paketi ekler ve madde listesi boş kalmış paketi başlangıç içeriğiyle doldurur.
const seeds = [
  {
    slug: "web",
    name: "Kurumsal Web Sitesi",
    description: "Firmanız için tasarlanmış, yayına alınmış ve bakımı bize ait web sitesi.",
    features: [
      "Firmanıza özel tasarım, hazır şablon değil",
      "Ana sayfa dahil 5 sayfaya kadar, ek sayfa ayrıca teklif edilir",
      "Mobil uyumlu, arama motorları için hazır",
      "Barındırma ve teknik bakım",
      "Destek talepleri panelden yanıtlanır",
    ],
    includesAds: false,
    featured: false,
    sortOrder: 1,
    monthlyPriceKurus: null as number | null, // [İÇERİK: fiyat henüz belirlenmedi]
  },
  {
    slug: "web-ads",
    name: "Kurumsal Web Sitesi + Google Ads Yönetimi",
    description: "Web sitesinin yanında Google reklam hesabınızı kurar ve yönetiriz.",
    features: [
      "Kurumsal Web Sitesi paketindeki her şey",
      "Google Ads hesabı kurulumu ve yönetimi",
      "Anahtar kelime, reklam metni ve bölge ayarı",
      "Aylık performans raporu",
    ],
    includesAds: true,
    featured: true,
    sortOrder: 2,
    monthlyPriceKurus: 300000 as number | null,
  },
  {
    slug: "web-omurluk",
    name: "Kurumsal Web Sitesi (Ömürlük)",
    description: "Tek seferlik ödemeyle kurulan kurumsal web sitesi. Aylık abonelik bedeli yoktur.",
    features: [
      "Firmanıza özel tasarım, hazır şablon değil",
      "Tek seferlik ödeme, aylık hizmet bedeli yok",
      "Mobil uyumlu, arama motorları için hazır",
      "Alan adı sizin adınıza kayıtlı olur, site içerikleri size teslim edilir",
      "Barındırma ve alan adı yenileme bedelleri paket dışındadır, yıllık olarak önceden bildirilir",
    ],
    includesAds: false,
    featured: false,
    billingType: "one_time" as const,
    sortOrder: 3,
    monthlyPriceKurus: null as number | null, // [İÇERİK: fiyat]
  },
  {
    slug: "web-ads-kurulum",
    name: "Kurumsal Web Sitesi + Google Ads Kurulumu",
    description: "Kurumsal web sitesi ve Google Ads hesabının tek seferlik kurulumu. Sürekli reklam yönetimi dahil değildir.",
    features: [
      "Kurumsal Web Sitesi (Ömürlük) paketindeki her şey",
      "Google Ads hesabı kurulumu ve ilk kampanyaların hazırlanması",
      "Dönüşüm takibi kurulumu",
      "Kurulum sonrasında reklam yönetimi ayrıca teklif edilir",
    ],
    includesAds: true,
    featured: false,
    billingType: "one_time" as const,
    sortOrder: 4,
    monthlyPriceKurus: null as number | null, // [İÇERİK: fiyat]
  },
];

async function main() {
  const { db, schema } = await import("../lib/db");
  const { and, eq, sql } = await import("drizzle-orm");

  const inserted = await db.insert(schema.packages).values(seeds).onConflictDoNothing({ target: schema.packages.slug }).returning({ slug: schema.packages.slug });

  // Yeni sütunlar eklenmeden önce oluşmuş kayıtları tamamla (madde listesi boşsa).
  for (const s of seeds) {
    await db
      .update(schema.packages)
      .set({ features: s.features, includesAds: s.includesAds, featured: s.featured, sortOrder: s.sortOrder })
      .where(and(eq(schema.packages.slug, s.slug), sql`jsonb_array_length(${schema.packages.features}) = 0`));
  }

  console.log(`Seed tamam. Eklenen paket: ${inserted.map((p) => p.slug).join(", ") || "yok (zaten var)"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
