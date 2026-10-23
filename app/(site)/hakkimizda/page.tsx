import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/page-head";
import { CtaBand, SectionHead } from "@/components/sections";
import { features } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Kaşif Yazılım kimdir, nasıl çalışır ve neye söz verir.",
  alternates: { canonical: "/hakkimizda" },
};

const principles = [
  { t: "Fiyat saklanmaz", d: "Aylık bedel, taahhüt süresi ve neyin dahil olmadığı sitede açıkça yazar. Sözleşmede sürpriz yoktur." },
  { t: "Sizin olan sizde kalır", d: "Alan adı, Google Ads hesabı ve içerikleriniz size aittir. Abonelik bitse de kaybetmezsiniz." },
  { t: "Garanti vermediğimiz şeyi vermeyiz", d: "Sıralama, tıklama ya da satış garantisi vermeyiz. Ölçülebilir iş yapar, neyin olduğunu şeffaf anlatırız." },
  { t: "Karar sizde", d: "Tasarımı siz onaylarsınız, reklam bütçesini siz belirlersiniz, memnun kalmazsanız iptal talebi açarsınız." },
];

export default function HakkimizdaPage() {
  return (
    <>
      <PageHead eyebrow="Kaşif Yazılım" title="Web sitesini ve reklamı tek elden yürütüyoruz" lead="Siteyi bir kez teslim edip kaybolmuyoruz. Aylık abonelikle çalışıyoruz: tasarım, yayın, bakım, destek ve (ikinci pakette) reklam yönetimi abonelik boyunca bizde." />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1fr_1.5fr]">
        <SectionHead title="Neden abonelik" />
        <div className="max-w-2xl space-y-5 text-lg">
          <p>
            Küçük ve orta ölçekli firmaların çoğu için web sitesi bir kerelik büyük bir harcama ve sonrasında sahipsiz bir iş olarak kalıyor: güncellenmiyor, mobilde
            bozuluyor, değişiklik için kimseye ulaşılamıyor. Biz bunu tersine çevirdik: sabit aylık bedel, açık kapsam ve her talebin takip edildiği bir panel.
          </p>
          <p>
            Reklam tarafında da aynı yaklaşım: hesap sizin, bütçe sizin, biz yönetiriz. Harcamanın nereye gittiğini Google hesabınızdan her zaman görürsünüz.
          </p>
          <p>
            Hazırladığımız ve yayında olan siteleri <Link href="/referanslar" className="underline underline-offset-4">Referanslar</Link> sayfasında görebilirsiniz.
          </p>
        </div>
      </section>

      <section className="border-y border-cizgi bg-kagit">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHead title="Çalışma ilkelerimiz" />
          <dl className="mt-10 grid gap-px bg-cizgi md:grid-cols-2">
            {principles.map((p) => (
              <div key={p.t} className="bg-beyaz p-8">
                <dt className="display text-xl text-emaye">{p.t}</dt>
                <dd className="mt-3">{p.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHead title="Daha fazlası" />
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-lg">
          <li><Link href="/hizmetler" className="underline underline-offset-4">Hizmetler</Link></li>
          <li><Link href="/nasil-calisir" className="underline underline-offset-4">Nasıl çalışır</Link></li>
          <li><Link href="/paketler" className="underline underline-offset-4">Paketler</Link></li>
          {features.blog ? <li><Link href="/blog" className="underline underline-offset-4">Blog</Link></li> : null}
          <li><Link href="/iletisim" className="underline underline-offset-4">İletişim</Link></li>
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
