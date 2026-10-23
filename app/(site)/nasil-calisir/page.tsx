import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { PageHead } from "@/components/page-head";
import { CtaBand, SectionHead } from "@/components/sections";
import { PanelMock } from "@/components/visuals";

export const metadata: Metadata = {
  title: "Nasıl çalışır",
  description: "Abonelikten yayına: paket seçimi, taahhütname, tasarım, onay ve yayın adımları ve sizden istediklerimiz.",
  alternates: { canonical: "/nasil-calisir" },
};

const steps = [
  {
    title: "Paketi seçin ve abone olun",
    who: "Siz",
    text: "Paketler sayfasından size uygun paketi seçersiniz. Firma bilgilerinizi (unvan, vergi bilgileri, adres, yetkili) girer, mesafeli satış sözleşmesini, ön bilgilendirme formunu ve KVKK metnini onaylar, kartınızla aboneliği başlatırsınız. Kart bilgileri iyzico'nun güvenli formuna girilir.",
    result: "Aboneliğiniz başlar, panele erişirsiniz.",
  },
  {
    title: "Taahhütnameyi imzalayın, formu doldurun",
    who: "Siz",
    text: "Panelinizden firma bilgilerinizle hazırlanmış taahhütnameyi indirir, çıktı alıp kaşe ve imzayla geri yüklersiniz. Aynı anda başlangıç formunu doldurursunuz: sektörünüz, hizmetleriniz, hedef bölgeniz, logonuz, alan adı bilgileriniz ve (reklam paketinde) reklam hedefleriniz.",
    result: "Taahhütname onaylanıp form gönderilince proje tasarım aşamasına geçer. Onaylanmadan geçmeyiz.",
  },
  {
    title: "Tasarım",
    who: "Biz",
    text: "Gönderdiğiniz bilgilere göre siteyi tasarlarız. Metinleri siz gönderdiyseniz kullanırız, bizden istediyseniz biz yazarız. Proje aşamasını panelden izlersiniz.",
    result: "Önizleme adresi panelinize eklenir.",
  },
  {
    title: "Önizleme ve onay",
    who: "Siz",
    text: "Önizlemeyi açar, beğenirseniz tek tıkla onaylarsınız. Değişiklik isterseniz neyin değişmesi gerektiğini yazar ve revizyon talep edersiniz; tasarıma döneriz.",
    result: "Onayınızla proje geliştirmeye geçer.",
  },
  {
    title: "Yayın",
    who: "Biz",
    text: "Siteyi sizin alan adınıza bağlar, güvenli bağlantıyla yayına alırız. Google Ads paketindeyseniz hesabı kurar ve reklamları başlatırız.",
    result: "Siteniz yayında. Bakım ve destek abonelik boyunca bizde.",
  },
  {
    title: "Sonrası: bakım, destek ve ödeme",
    who: "Biz",
    text: "Değişiklik ve sorularınız için panelden talep açarsınız. Aylık ödemeleriniz otomatik çekilir, faturalarınızı panelden indirirsiniz. Kartınızı panelden güncelleyebilirsiniz.",
    result: "Her şey tek panelde.",
  },
];

const needs = [
  "Firma bilgileriniz: unvan, vergi dairesi ve numarası, adres, yetkili kişi",
  "İmzalı ve kaşeli taahhütname (panelden indirilir)",
  "Logo ve varsa marka renkleri",
  "Sitede kullanılacak metinler ya da bizden yazmamızı istediğiniz konular",
  "Fotoğraflar (ürün, ekip, işyeri), en fazla 10 adet yükleyebilirsiniz",
  "Alan adı bilgisi: varsa kimin adına kayıtlı olduğu ve DNS erişimi",
  "Reklam paketinde: hedef aylık reklam bütçeniz ve Google Ads hesabı bilgisi",
];

export default function NasilCalisirPage() {
  return (
    <>
      <PageHead eyebrow="Süreç" title="Abonelikten yayına nasıl ilerliyoruz" lead="Altı adım. Kimin neyi yaptığını ve her adımın sonunda ne olduğunu baştan bilirsiniz." />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr]">
        <ol className="space-y-0 border-l-4 border-murekkep">
          {steps.map((s, i) => (
            <li key={s.title} className="relative -ml-1 border-l-4 border-transparent pb-10 pl-8 first:pt-0">
              <span className="display absolute -left-[1.4rem] top-0 grid h-10 w-10 place-items-center bg-tabela text-lg text-murekkep">{i + 1}</span>
              <p className="ui text-sm text-soluk">{s.who} yaparsınız{s.who === "Biz" ? "" : ""}</p>
              <h2 className="display mt-1 text-2xl text-emaye">{s.title}</h2>
              <p className="mt-3 text-lg">{s.text}</p>
              <p className="mt-3 border-l-4 border-tabela bg-tabela-acik px-4 py-2 text-[0.97rem]"><strong>Sonuç:</strong> {s.result}</p>
            </li>
          ))}
        </ol>
        <div className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <PanelMock />
          <p className="text-sm text-soluk">Panelden proje aşamasını, önizlemeyi ve geçmişi görürsünüz. Örnek görünümdür.</p>
        </div>
      </section>

      <section className="border-y border-cizgi bg-kagit">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1fr_1.4fr]">
          <SectionHead title="Sizden istediklerimiz" lead="Hepsini başlangıç formunda adım adım girersiniz; taslak olarak kaydedip sonra devam edebilirsiniz." />
          <ul className="space-y-3">
            {needs.map((n) => (
              <li key={n} className="flex gap-3 border-b border-cizgi pb-3">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1.5 h-4 w-4 shrink-0 text-emaye"><path d="M3 10.5l4.5 4.5L17 5" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1fr_1.7fr]">
        <div>
          <h2 className="display text-3xl text-emaye">Süreyle ilgili sorular</h2>
          <p className="mt-4 text-soluk">Yayın süresi, sizin bilgi ve onay hızınıza da bağlıdır. <Link href="/sss" className="underline underline-offset-4">Tüm sorular</Link></p>
        </div>
        <Faq
          items={[
            { q: "Taahhütname neden gerekli?", a: "12 aylık taahhüdünüzü ve hizmetin temel şartlarını belgelemek için. Onaylanmadan tasarım aşamasına geçmeyiz; böylece iki taraf da ne üzerinde anlaştığını net bilir." },
            { q: "Önizlemeyi beğenmezsem ne olur?", a: "Neyin değişmesini istediğinizi yazar, revizyon talep edersiniz; proje tasarım aşamasına döner ve değişiklikleri yaparız." },
            { q: "Formu tek seferde doldurmam gerekiyor mu?", a: "Hayır. Taslak olarak kaydedip daha sonra kaldığınız yerden devam edebilirsiniz. Gönderince form kilitlenir; sonraki değişiklikler destek talebiyle yapılır." },
          ]}
        />
      </section>
      <CtaBand />
    </>
  );
}
