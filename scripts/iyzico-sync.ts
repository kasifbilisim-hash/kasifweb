import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

/*
 * packages tablosunu iyzico ürün/plan kayıtlarıyla eşler.
 *   npm run iyzico:sync            → yalnızca ne yapılacağını yazar
 *   npm run iyzico:sync -- --apply → iyzico'da oluşturur, referansları veritabanına yazar
 *
 * iyzico planında yalnızca ad ve deneme süresi değişebilir (doküman). Fiyat değiştiyse yeni plan
 * açılır ve packages.iyzico_plan_ref ona çevrilir; mevcut aboneler eski planda kalır, etkilenmez.
 */
const COMMITMENT_MONTHS = 12;
const apply = process.argv.includes("--apply");

async function main() {
  const { db, schema } = await import("../lib/db");
  const { eq } = await import("drizzle-orm");
  const { createPlan, createProduct, getPlan } = await import("../lib/iyzico/subscription");

  const packages = await db.select().from(schema.packages);
  for (const pkg of packages) {
    if (!pkg.active || pkg.monthlyPriceKurus === null || pkg.billingType !== "subscription") {
      console.log(`- ${pkg.slug}: atlandı (pasif, fiyat belirlenmedi ya da tek seferlik)`);
      continue;
    }

    let productRef = pkg.iyzicoProductRef;
    let planRef = pkg.iyzicoPlanRef;

    if (!productRef) {
      console.log(`- ${pkg.slug}: ürün oluşturulacak`);
      if (apply) productRef = await createProduct(pkg.name, pkg.description);
    }

    let needPlan = !planRef;
    if (planRef) {
      const plan = await getPlan(planRef);
      const priceMatches = Math.round(plan.price * 100) === pkg.monthlyPriceKurus;
      const termMatches = plan.recurrenceCount === COMMITMENT_MONTHS && plan.paymentInterval === "MONTHLY";
      if (!priceMatches || !termMatches) {
        console.log(`- ${pkg.slug}: plan fiyatı/süresi değişmiş, yeni plan oluşturulacak (mevcut aboneler etkilenmez)`);
        needPlan = true;
      }
    } else {
      console.log(`- ${pkg.slug}: plan oluşturulacak`);
    }

    if (needPlan && apply) {
      if (!productRef) throw new Error("Ürün referansı yok");
      planRef = await createPlan({
        productReferenceCode: productRef,
        name: `${pkg.name} (${COMMITMENT_MONTHS} ay)`,
        priceKurus: pkg.monthlyPriceKurus,
        recurrenceCount: COMMITMENT_MONTHS,
      });
    }

    if (apply) {
      await db
        .update(schema.packages)
        .set({ iyzicoProductRef: productRef, iyzicoPlanRef: planRef })
        .where(eq(schema.packages.id, pkg.id));
      console.log(`  ${pkg.slug}: ürün=${productRef} plan=${planRef}`);
    } else if (!needPlan && productRef) {
      console.log(`- ${pkg.slug}: güncel`);
    }
  }
  if (!apply) console.log("\nDeğişiklik yapılmadı. Uygulamak için: npm run iyzico:sync -- --apply");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
