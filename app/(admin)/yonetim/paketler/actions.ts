"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { packageSchema } from "@/lib/validation/admin";

export type PackageState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  version?: number;
  values?: PackageValues;
};

export type PackageValues = {
  name: string;
  description: string;
  features: string;
  price: string;
  sortOrder: string;
  active: boolean;
  featured: boolean;
  includesAds: boolean;
  billingType: string;
  domainFeeExtra: boolean;
  domainFee: string;
};

function readForm(formData: FormData): PackageValues {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    features: String(formData.get("features") ?? ""),
    price: String(formData.get("price") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    includesAds: formData.get("includesAds") === "on",
    billingType: String(formData.get("billingType") ?? "subscription"),
    domainFeeExtra: formData.get("domainFeeExtra") === "on",
    domainFee: String(formData.get("domainFee") ?? ""),
  };
}

function fail(error: import("zod").ZodError, values: PackageValues): PackageState {
  const errors: Record<string, string> = {};
  for (const i of error.issues) errors[String(i.path[0])] ??= i.message;
  return { errors, values, version: Date.now() };
}

function refresh() {
  revalidateTag("packages", "max");
  revalidatePath("/yonetim/paketler");
}

/**
 * Paket düzenleme. iyzico planında fiyat değiştirilemez (yalnızca ad ve deneme süresi): fiyat değişirse plan
 * referansı temizlenir; `npm run iyzico:sync -- --apply` yeni planı açar. O zamana kadar yeni abonelik
 * başlamaz (eski fiyatla çekim olmasın). Mevcut aboneler eski planda kalır, etkilenmez.
 */
export async function updatePackage(packageId: string, _prev: PackageState, formData: FormData): Promise<PackageState> {
  const admin = await requireAdmin();
  const [pkg] = await db.select().from(schema.packages).where(eq(schema.packages.id, packageId));
  if (!pkg) return { message: "Paket bulunamadı." };

  const raw = readForm(formData);
  const parsed = packageSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error, raw);
  const { name, description, features, price, sortOrder, active, featured, includesAds, billingType, domainFeeExtra, domainFee } = parsed.data;

  const priceChanged = price !== pkg.monthlyPriceKurus;
  const planCleared = priceChanged && pkg.iyzicoPlanRef !== null;

  await db
    .update(schema.packages)
    .set({ name, description, features, monthlyPriceKurus: price, sortOrder, active, featured, includesAds, billingType, domainFeeExtra, domainFeeKurus: domainFee, ...(planCleared ? { iyzicoPlanRef: null } : {}) })
    .where(eq(schema.packages.id, pkg.id));
  await writeAudit({
    actorUserId: admin.id,
    action: "package.updated",
    targetTable: "packages",
    targetId: pkg.id,
    details: {
      from: { name: pkg.name, description: pkg.description, features: pkg.features, monthlyPriceKurus: pkg.monthlyPriceKurus, active: pkg.active, featured: pkg.featured, includesAds: pkg.includesAds },
      to: { name, description, features, monthlyPriceKurus: price, active, featured, includesAds, billingType, domainFeeExtra, domainFeeKurus: domainFee },
      iyzicoPlanCleared: planCleared,
    },
  });

  refresh();
  return {
    ok: true,
    version: Date.now(),
    message: planCleared
      ? "Kaydedildi. Fiyat değiştiği için iyzico planı kapatıldı: yeni abonelikler, `npm run iyzico:sync -- --apply` yeni planı açana kadar başlamaz. Mevcut aboneler etkilenmez."
      : priceChanged && price !== null
        ? "Kaydedildi. iyzico planı henüz yok: `npm run iyzico:sync -- --apply` ile açın."
        : "Kaydedildi.",
  };
}

/** Yeni paket. Adres adı (slug) addan üretilir ve sonradan değişmez. */
export async function createPackage(_prev: PackageState, formData: FormData): Promise<PackageState> {
  const admin = await requireAdmin();
  const raw = readForm(formData);
  const parsed = packageSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error, raw);
  const d = parsed.data;

  const base = slugify(d.name) || "paket";
  let slug = base;
  for (let n = 2; ; n++) {
    const [taken] = await db.select({ id: schema.packages.id }).from(schema.packages).where(eq(schema.packages.slug, slug));
    if (!taken) break;
    slug = `${base}-${n}`;
  }

  const [created] = await db
    .insert(schema.packages)
    .values({ slug, name: d.name, description: d.description, features: d.features, monthlyPriceKurus: d.price, sortOrder: d.sortOrder, active: d.active, featured: d.featured, includesAds: d.includesAds, billingType: d.billingType, domainFeeExtra: d.domainFeeExtra, domainFeeKurus: d.domainFee })
    .returning({ id: schema.packages.id });
  await writeAudit({ actorUserId: admin.id, action: "package.created", targetTable: "packages", targetId: created.id, details: { slug, name: d.name, monthlyPriceKurus: d.price } });

  refresh();
  redirect("/yonetim/paketler");
}

/** Silme yalnızca hiç aboneliği olmayan paket için; abonesi olan paket pasife alınır. */
export async function deletePackage(packageId: string): Promise<void> {
  const admin = await requireAdmin();
  const [pkg] = await db.select().from(schema.packages).where(eq(schema.packages.id, packageId));
  if (!pkg) return;
  const [used] = await db.select({ n: count() }).from(schema.subscriptions).where(eq(schema.subscriptions.packageId, packageId));
  if ((used?.n ?? 0) > 0) return;

  await db.delete(schema.packages).where(eq(schema.packages.id, packageId));
  await writeAudit({ actorUserId: admin.id, action: "package.deleted", targetTable: "packages", targetId: packageId, details: { slug: pkg.slug, name: pkg.name } });
  refresh();
}
