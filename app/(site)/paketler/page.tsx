import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/page-head";
import { CtaBand, PackageGrid } from "@/components/sections";
import { getPackages } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Paketler ve fiyatlar",
  description:
    "Kurumsal web sitesi ve Google Ads yönetimi paketleri. 12 ay taahhüt, aylık otomatik ödeme. Reklam bütçesi müşteriye aittir.",
  alternates: { canonical: "/paketler" },
};

const conditions: [string, React.ReactNode][] = [
  ["Reklam bütçesi", "Google Ads harcaması size aittir ve kartınızdan doğrudan Google'a ödenir. Aboneliğimiz yalnızca hizmet bedelidir."],
  ["Taahhüt", "12 ay. Hizmet bedeli her ay kartınızdan iyzico aracılığıyla otomatik çekilir ve taahhüt süresince artmaz."],
  ["Memnuniyet iptali", "12 ay içinde memnun kalmazsanız panelinizden iptal talebi açarsınız. İptal anında olmaz: talep ekibimize ulaşır, yöneticimiz onaylarsa aboneliğiniz iptal edilir ve hizmetler sona erer."],
  ["Alan adı", "Sizin adınıza kayıtlı olur ve iptalde sizde kalır."],
  ["Taahhütname", "Abonelikten sonra firma bilgilerinizle hazırlanan taahhütnameyi imzalayıp yüklersiniz. Yöneticimiz onaylamadan tasarım aşamasına geçmeyiz."],
  ["Cayma hakkı", <>Tüketici iseniz 14 günlük yasal cayma hakkınız saklıdır. <Link href="/yasal/iptal-iade" className="underline underline-offset-4">Ayrıntılar</Link></>],
];

export default async function PaketlerPage() {
  const packages = await getPackages();
  return (
    <>
      <PageHead
        eyebrow="Paketler"
        title="Açık fiyat, açık koşullar"
        lead="Abonelik paketlerinde fiyatlar aylıktır ve abonelik 12 aylıktır; tek seferlik paketlerde fiyat bir defa ödenir. Fiyatlara KDV dahil değildir."
      />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <PackageGrid packages={packages} />
      </section>

      <section className="on-gece bg-gece text-beyaz">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.5fr]">
          <h2 className="display text-4xl">Koşullar, saklamadan</h2>
          <dl className="space-y-6 text-lg">
            {conditions.map(([k, v]) => (
              <div key={k} className="border-t border-beyaz/20 pt-5">
                <dt className="ui text-tabela">{k}</dt>
                <dd className="mt-1 text-beyaz/90">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <CtaBand title="Hangi paket size uygun, emin değil misiniz?" text="Bizi arayın ya da WhatsApp'tan yazın, işinize uygun paketi birlikte seçelim." />
    </>
  );
}
