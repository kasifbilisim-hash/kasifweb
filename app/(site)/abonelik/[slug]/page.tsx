import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatTL } from "@/lib/packages";
import { getSession } from "@/lib/session";
import { COMMITMENT_MONTHS } from "@/lib/legal";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Abonelik başlat", robots: { index: false } };

export default function AbonelikPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Giriş yoksa önce giriş/kayıt, sonra bu sayfaya dön.
  const session = await getSession();
  if (!session) redirect(`/kayit?next=${encodeURIComponent(`/abonelik/${slug}`)}`);

  const [pkg] = await db.select().from(schema.packages).where(eq(schema.packages.slug, slug));
  if (!pkg || !pkg.active || pkg.billingType !== "subscription") notFound();

  const [company] = await db.select().from(schema.companies).where(eq(schema.companies.userId, session.user.id));
  const open = pkg.monthlyPriceKurus !== null && pkg.iyzicoPlanRef !== null;

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-14 md:grid-cols-[1fr_1.4fr] md:pt-20">
      <div className="h-fit md:sticky md:top-8">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Abonelik</h1>
        <div className="levha mt-8 bg-tabela p-6">
          <p className="ui text-xl">{pkg.name}</p>
          <p className="display mt-4 text-4xl">{formatTL(pkg.monthlyPriceKurus)}</p>
          <p className="mt-1">aylık</p>
          <ul className="mt-5 space-y-2 border-t-2 border-murekkep pt-5">
            <li>{COMMITMENT_MONTHS} ay taahhüt, her ay karttan otomatik çekim</li>
            <li>Memnun kalmazsanız {COMMITMENT_MONTHS} ay içinde iptal talebi açarsınız</li>
            {pkg.includesAds ? <li>Google Ads bütçesi bu tutara dahil değildir, size aittir</li> : null}
          </ul>
        </div>
      </div>

      <div className="border-4 border-murekkep bg-beyaz p-6 md:p-8">
        {open ? (
          <CheckoutForm
            slug={slug}
            defaults={{
              legalName: company?.legalName,
              taxOffice: company?.taxOffice,
              taxNumber: company?.taxNumber,
              address: company?.address,
              city: company?.city,
              contactName: company?.contactName,
              contactPhone: company?.contactPhone,
            }}
          />
        ) : (
          <p className="text-lg">Bu paket için abonelik henüz açılmadı. Fiyat ve ödeme planı hazır olunca burada başlatabilirsiniz.</p>
        )}
      </div>
    </section>
  );
}
