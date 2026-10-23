import type { Metadata } from "next";
import { asc, count, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { NewPackageForm, PackageForm } from "./package-form";

export const metadata: Metadata = { title: "Paketler", robots: { index: false } };

export default function PaketlerPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const rows = await db.select().from(schema.packages).orderBy(asc(schema.packages.sortOrder), asc(schema.packages.createdAt));
  const used = await Promise.all(
    rows.map(async (r) => (await db.select({ n: count() }).from(schema.subscriptions).where(eq(schema.subscriptions.packageId, r.id)))[0]?.n ?? 0),
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Paketler</h1>
      <p className="mt-4 max-w-2xl text-soluk">
        Paketlerin adı, özeti, madde listesi ve fiyatı buradan düzenlenir, sitedeki paket sayfaları anında güncellenir. Yeni paket de ekleyebilirsiniz.
        Fiyat değişince iyzico planı kapanır; <code>npm run iyzico:sync -- --apply</code> yeni planı açar. Mevcut aboneler eski fiyatla devam eder.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {rows.map((r, i) => (
          <article key={r.id} className="border-4 border-murekkep bg-beyaz p-6">
            <h2 className="ui text-lg">{r.name}</h2>
            <p className="mb-5 mt-1 text-sm text-soluk">
              {r.billingType === "one_time" ? "Tek seferlik" : `Adres: /abonelik/${r.slug}`} · iyzico: {r.iyzicoPlanRef ? "plan açık" : "plan yok"}{r.iyzicoProductRef ? "" : ", ürün yok"} · {used[i]} abonelik
            </p>
            <PackageForm
              pkg={{
                id: r.id,
                slug: r.slug,
                canDelete: used[i] === 0,
                planRef: r.iyzicoPlanRef,
                values: {
                  name: r.name,
                  description: r.description,
                  features: r.features.join("\n"),
                  price: r.monthlyPriceKurus === null ? "" : String(r.monthlyPriceKurus / 100).replace(".", ","),
                  sortOrder: String(r.sortOrder),
                  active: r.active,
                  featured: r.featured,
                  includesAds: r.includesAds,
                  billingType: r.billingType,
                  domainFeeExtra: r.domainFeeExtra,
                  domainFee: r.domainFeeKurus === null ? "" : String(r.domainFeeKurus / 100).replace(".", ","),
                },
              }}
            />
          </article>
        ))}
      </div>

      <details className="mt-12 border-4 border-murekkep bg-beyaz p-6">
        <summary className="ui cursor-pointer text-lg">Yeni paket ekle</summary>
        <div className="mt-6 max-w-2xl">
          <NewPackageForm />
        </div>
      </details>
    </section>
  );
}
