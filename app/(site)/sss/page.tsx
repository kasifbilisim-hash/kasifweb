import type { Metadata } from "next";
import Link from "next/link";
import { Faq, faqItems, faqJsonLd, type FaqItem } from "@/components/faq";
import { PageHead } from "@/components/page-head";
import { CtaBand } from "@/components/sections";
import { jsonLdString } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Sık sorulan sorular",
  description: "Abonelik, taahhüt, iptal, reklam bütçesi, alan adı ve ödeme hakkında sık sorulan sorular.",
  alternates: { canonical: "/sss" },
};

const groups: { title: string; items: FaqItem[] }[] = [
  { title: "Abonelik ve ödeme", items: [faqItems[1], faqItems[6], { q: "Ödeme başarısız olursa ne olur?", a: "iyzico çekimi yeniden dener, size e-posta göndeririz ve panelde uyarı görürsünüz. Kartınızı panelden güncelleyebilirsiniz. Ödeme uzun süre alınamazsa hizmet, bildirim yapılarak askıya alınabilir." }, { q: "Faturamı nereden alırım?", a: "Ödeme sonrası fatura hazırlanır ve panelinizdeki Ödemeler sayfasından indirirsiniz." }] },
  { title: "İptal ve cayma", items: [faqItems[2], { q: "İptal talebi açınca abonelik hemen biter mi?", a: "Hayır. Talep ekibimize iletilir ve değerlendirilir. Onaylanırsa abonelik iptal edilir; karar verilene kadar hizmet ve aylık çekim sürer." }, { q: "İptal edersem alan adım ne olur?", a: "Sizde kalır. Alan adı sizin adınıza kayıtlıdır." }] },
  { title: "Reklam", items: [faqItems[0], { q: "Google Ads hesabı kimin adına olur?", a: "Sizin adınıza. Biz yönetim erişimiyle çalışırız; abonelik biterse erişimi kaldırırız, hesabınız ve geçmişi sizde kalır." }, { q: "Reklamlardan sonuç garantisi var mı?", a: "Hayır. Belirli sayıda tıklama, arama ya da satış garantisi vermiyoruz; sonuç sektöre, rekabete ve bütçeye göre değişir." }] },
  { title: "Site ve süreç", items: [faqItems[4], faqItems[5], faqItems[7], faqItems[3]] },
];

const all = groups.flatMap((g) => g.items);

export default function SssPage() {
  return (
    <>
      <PageHead eyebrow="Yardım" title="Sık sorulan sorular" lead="Aradığınızı bulamazsanız bize yazın, panelinizdeki destek bölümünden de sorabilirsiniz." />
      <section className="mx-auto max-w-4xl space-y-14 px-5 py-16">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="display mb-5 text-2xl text-emaye">{g.title}</h2>
            <Faq items={g.items} />
          </div>
        ))}
        <p className="text-lg">Hâlâ sorunuz mu var? <Link href="/iletisim" className="underline underline-offset-4">Bize yazın</Link>.</p>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd(all)) }} />
      <CtaBand />
    </>
  );
}
