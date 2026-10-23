import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema } from "@/lib/db";

// Paketlerin tamamı (ad, özet, madde listesi, fiyat, sıra) `packages` tablosundan gelir ve yönetim panelinden
// düzenlenir; yeni paket eklenebilir. Hiçbir slug kodda sabit değildir.
export type PackageInfo = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  features: string[];
  includesAds: boolean;
  featured: boolean;
  billingType: "subscription" | "one_time";
  domainFeeExtra: boolean;
  domainFeeKurus: number | null;
  monthlyPriceKurus: number | null; // tek seferlik pakette toplam fiyat
};

/** Sitede gösterilen (aktif) paketler, sıraya göre. Önbelleklidir; yönetimde değişiklik olunca "packages" etiketi temizlenir. */
export async function getPackages(): Promise<PackageInfo[]> {
  "use cache";
  cacheTag("packages");
  cacheLife("hours");
  const rows = await db.select().from(schema.packages).where(eq(schema.packages.active, true)).orderBy(asc(schema.packages.sortOrder), asc(schema.packages.createdAt));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    summary: r.description,
    features: r.features,
    includesAds: r.includesAds,
    featured: r.featured,
    billingType: r.billingType,
    domainFeeExtra: r.domainFeeExtra,
    domainFeeKurus: r.domainFeeKurus,
    monthlyPriceKurus: r.monthlyPriceKurus,
  }));
}

/** Fiyatın altındaki ek satır: "+ alan adı ücreti: 400 TL / yıl" ya da tutar yoksa "(kayıttan önce bildirilir)". Ücret yoksa null. */
export function domainFeeLine(p: Pick<PackageInfo, "domainFeeExtra" | "domainFeeKurus">): string | null {
  if (!p.domainFeeExtra) return null;
  return p.domainFeeKurus !== null ? `+ alan adı ücreti: ${formatTL(p.domainFeeKurus)} / yıl` : "+ alan adı ücreti (kayıttan önce bildirilir)";
}

export function formatTL(kurus: number | null): string {
  if (kurus === null) return "[İÇERİK: fiyat]";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(kurus / 100) + " TL";
}
