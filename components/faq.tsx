export type FaqItem = { q: string; a: string };

export const faqItems: FaqItem[] = [
  {
    q: "Reklam bütçesini kim öder?",
    a: "Siz ödersiniz. Google Ads harcaması sizin kartınızdan doğrudan Google'a çekilir. Bizim aboneliğimiz yalnızca hizmet bedelidir; reklam bütçesi buna dahil değildir. Aylık bütçeyi siz belirlersiniz.",
  },
  {
    q: "Taahhüt ne demek?",
    a: "Abonelik 12 aylıktır. Her ay hizmet bedeli kartınızdan otomatik çekilir. Bedel iyzico üzerinden alınır, kart bilgilerinizi biz görmeyiz. Taahhüt süresince aylık bedel artmaz.",
  },
  {
    q: "12 ay dolmadan memnun kalmazsam?",
    a: "12 ay içinde panelinizden iptal talebi açabilirsiniz. Talep anında işleme girmez; ekibimize ulaşır, yöneticimiz onaylarsa iyzico aboneliğiniz iptal edilir ve hizmetlerimiz sona erer. Tüketici iseniz 14 günlük yasal cayma hakkınız ayrıca saklıdır.",
  },
  {
    q: "Alan adı kimde kalır?",
    a: "Sizde. Alan adı sizin adınıza kayıtlı olur. Abonelik bitse de alan adınız size aittir.",
  },
  {
    q: "Sadece web sitesi alabilir miyim?",
    a: "Evet. Kurumsal Web Sitesi paketi tek başına alınabilir. Google Ads yönetimi içeren paketi ise Paketler sayfasında görebilirsiniz.",
  },
  {
    q: "Site ne kadar sürede yayına girer?",
    a: "Genellikle 10 ila 15 iş günü; içerikleriniz eksiksiz ulaştıktan sonra başlar. Süre, bilgi ve içeriklerinizi ne kadar çabuk ilettiğinize ve önizlemeyi ne zaman onayladığınıza da bağlıdır.",
  },
  {
    q: "Kart bilgilerimi görüyor musunuz?",
    a: "Hayır. Kart bilgileri yalnızca ödeme kuruluşu iyzico'nun güvenli formuna girilir. Biz yalnızca ödemenin sonucunu görürüz.",
  },
  {
    q: "Sonradan değişiklik isteyebilir miyim?",
    a: "Evet. Metin, görsel ve küçük düzen değişikliklerini panelinizden talep açarak iletirsiniz; abonelik süresince bizim tarafımızdan yapılır. Paket kapsamını aşan işler ayrıca teklif edilir.",
  },
];

export function Faq({ items = faqItems }: { items?: FaqItem[] }) {
  return (
    <div className="divide-y divide-cizgi border-y border-cizgi bg-beyaz">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-5 open:bg-kagit">
          <summary className="ui flex cursor-pointer list-none items-start justify-between gap-6 text-lg [&::-webkit-details-marker]:hidden">
            {item.q}
            <span aria-hidden className="mt-0.5 shrink-0 text-2xl leading-none group-open:hidden">+</span>
            <span aria-hidden className="mt-0.5 hidden shrink-0 text-2xl leading-none group-open:inline">−</span>
          </summary>
          <p className="mt-3 max-w-2xl text-soluk">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Arama motorları için SSS yapılandırılmış verisi. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}
