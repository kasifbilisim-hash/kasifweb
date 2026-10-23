import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";
import { CtaBand, PackageGrid, SectionHead } from "@/components/sections";
import { Faq, faqItems } from "@/components/faq";
import { AdsMock, PanelMock, Pictogram, SiteMock } from "@/components/visuals";
import { formatPostDate, getPublishedPosts } from "@/lib/blog";
import { domainFeeLine, formatTL, getPackages } from "@/lib/packages";

const steps = [
  { title: "Paketi seçin, abone olun", text: "Firma bilgilerinizi girer, sözleşmeleri onaylar ve kartınızla aboneliği başlatırsınız." },
  { title: "Taahhütnameyi imzalayın", text: "Firma bilgilerinizle hazırlanan taahhütnameyi indirir, kaşe ve imzayla yüklersiniz. Başlangıç formunu doldurursunuz." },
  { title: "Biz tasarlarız, siz onaylarsınız", text: "Tasarımı hazırlarız. Önizlemeyi panelden görür, onaylar ya da revizyon istersiniz." },
  { title: "Siteniz yayında", text: "Alan adınıza bağlar, yayına alırız. Google Ads paketindeyseniz reklamlar da başlar." },
];

const facts = [
  { icon: "alan" as const, title: "Alan adı sizde", text: "Sizin adınıza kayıtlı olur, abonelik bitse de sizde kalır." },
  { icon: "reklam" as const, title: "Reklam bütçesi sizin", text: "Google harcaması kartınızdan doğrudan Google'a ödenir." },
  { icon: "kart" as const, title: "Kart bilgisi bizde yok", text: "Ödeme iyzico'nun güvenli formunda alınır." },
  { icon: "iptal" as const, title: "Memnuniyet iptali", text: "12 ay içinde memnun kalmazsanız panelden talep açarsınız." },
];

export default async function Home() {
  const [packages, posts] = await Promise.all([getPackages(), getPublishedPosts(3)]);

  const variants = ["mobilya", "hukuk", "klinik"] as const;
  const priceLine = (p: (typeof packages)[number]) =>
    p.monthlyPriceKurus === null ? "Fiyat yakında" : p.billingType === "one_time" ? `${formatTL(p.monthlyPriceKurus)} tek seferlik` : `${formatTL(p.monthlyPriceKurus)} / ay`;

  const slideLabels = ["Kaşif Yazılım", ...packages.map((p) => p.name)];
  const slides = [
    <div key="marka" className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-12 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
      <div>
        <p className="ui inline-block bg-tabela px-3 py-1 text-sm text-murekkep">Kurumsal web sitesi + Google Ads</p>
        <h1 className="display giris mt-6 text-[2.4rem] sm:text-6xl">Sitenizi kurar, reklamınızı yönetiriz. Size uygun paketle.</h1>
        <p className="mt-7 max-w-xl text-xl text-beyaz/85">
          Firmanıza özel tasarlanmış web sitesi, Google Ads yönetimi ve sonrasında bakım. Aylık abonelik ya da tek seferlik ödeme: ihtiyacınıza göre paketi siz seçersiniz.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/paketler" className="ui bg-tabela px-8 py-4 text-lg text-murekkep hover:bg-beyaz">Paketleri gör</Link>
          <Link href="/nasil-calisir" className="ui border-2 border-beyaz/50 px-8 py-4 text-lg hover:bg-beyaz hover:text-gece">Nasıl çalışır</Link>
        </div>
        <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-2 text-beyaz/85">
          {["Açık fiyat, saklı koşul yok", "Alan adı sizde kalır", "Reklam bütçesi size ait"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-tabela"><path d="M3 10.5l4.5 4.5L17 5" fill="none" stroke="currentColor" strokeWidth="2.6" /></svg>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <figure className="relative mx-auto w-full max-w-xl pb-10 pr-4 lg:pb-14">
        <div className="rotate-[-1.5deg]"><SiteMock variant="mobilya" /></div>
        <div className="absolute -bottom-2 right-0 w-[62%] rotate-[2deg] shadow-[8px_8px_0_#f2b705]"><AdsMock /></div>
        <figcaption className="mt-6 text-sm text-beyaz/60">Örnek tasarım ve örnek reklam görünümü. Müşteri çalışması değildir.</figcaption>
      </figure>
    </div>,
    ...packages.map((p, i) => (
      <div key={p.id} className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-12 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <p className="ui inline-block bg-tabela px-3 py-1 text-sm text-murekkep">{p.billingType === "one_time" ? "Tek seferlik paket" : "Aylık abonelik"}</p>
          <h2 className="display mt-6 text-[2.2rem] sm:text-5xl">{p.name}</h2>
          {p.summary ? <p className="mt-6 max-w-xl text-xl text-beyaz/85">{p.summary}</p> : null}
          <p className="display mt-7 text-3xl text-tabela sm:text-4xl">{priceLine(p)}</p>
          {domainFeeLine(p) ? <p className="mt-1 text-beyaz/85">{domainFeeLine(p)}</p> : null}
          {p.includesAds ? <p className="mt-1 text-beyaz/70">Reklam bütçesi dahil değildir, size aittir.</p> : null}
          {p.features.length > 0 ? (
            <ul className="mt-6 space-y-2 text-beyaz/90">
              {p.features.slice(0, 3).map((f) => (
                <li key={f} className="flex gap-3">
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1.5 h-4 w-4 shrink-0 text-tabela"><path d="M3 10.5l4.5 4.5L17 5" fill="none" stroke="currentColor" strokeWidth="2.6" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {p.monthlyPriceKurus !== null && p.billingType === "subscription" ? (
              <Link href={`/abonelik/${p.slug}`} className="ui bg-tabela px-8 py-4 text-lg text-murekkep hover:bg-beyaz">Abone ol</Link>
            ) : p.monthlyPriceKurus !== null ? (
              <Link href="/iletisim" className="ui bg-tabela px-8 py-4 text-lg text-murekkep hover:bg-beyaz">Teklif al</Link>
            ) : null}
            <Link href="/paketler" className="ui border-2 border-beyaz/50 px-8 py-4 text-lg hover:bg-beyaz hover:text-gece">Tüm paketler</Link>
          </div>
        </div>
        <figure className="relative mx-auto w-full max-w-xl pb-10 pr-4 lg:pb-14">
          <div className={i % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]"}><SiteMock variant={variants[i % variants.length]} /></div>
          {p.includesAds ? <div className="absolute -bottom-2 right-0 w-[62%] rotate-[2deg] shadow-[8px_8px_0_#f2b705]"><AdsMock /></div> : null}
          <figcaption className="mt-6 text-sm text-beyaz/60">Örnek tasarım{p.includesAds ? " ve örnek reklam görünümü" : ""}. Müşteri çalışması değildir.</figcaption>
        </figure>
      </div>
    )),
  ];

  return (
    <>
      {/* 1. İlk ekran: kayar alan. Marka slaytı + her paket için bir slayt */}
      <section aria-label="Öne çıkanlar" className="on-gece overflow-hidden bg-gece text-beyaz">
        <HeroSlider labels={slideLabels} slides={slides} />
      </section>

      {/* 2. Güven şeridi */}
      <section className="border-b border-cizgi bg-beyaz">
        <ul className="mx-auto grid max-w-6xl divide-cizgi px-5 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {facts.map((f) => (
            <li key={f.title} className="flex gap-4 py-7 sm:px-6 first:sm:pl-0">
              <span className="text-emaye"><Pictogram name={f.icon} className="h-8 w-8" /></span>
              <span>
                <span className="ui block">{f.title}</span>
                <span className="mt-1 block text-[0.95rem] text-soluk">{f.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Hizmetler: görselle birlikte */}
      <section className="mx-auto max-w-6xl space-y-20 px-5 py-20 md:py-28">
        <SectionHead title="Ne yapıyoruz" lead="Üç iş: siteyi kurmak, reklamı yönetmek, sonrasını üstlenmek." />

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="ui text-sm text-soluk">Web sitesi</p>
            <h3 className="display mt-2 text-3xl text-emaye">Hazır şablon değil, firmanıza özel</h3>
            <p className="mt-4 text-lg">Sektörünüzü ve müşterinizi dinleyip siteyi sıfırdan tasarlarız. Mobil uyumlu, hızlı ve arama motorlarının anlayacağı biçimde yayına alırız.</p>
            <Link href="/hizmetler/kurumsal-web-sitesi" className="ui mt-6 inline-block border-b-2 border-murekkep pb-0.5 hover:border-emaye hover:text-emaye">Kurumsal web sitesi hizmeti</Link>
          </div>
          <SiteMock variant="hukuk" />
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="order-2 lg:order-1"><AdsMock /></div>
          <div className="order-1 lg:order-2">
            <p className="ui text-sm text-soluk">Google Ads</p>
            <h3 className="display mt-2 text-3xl text-emaye">Hesap sizin, bütçe sizin, yönetim bizim</h3>
            <p className="mt-4 text-lg">Reklam hesabını kurar, anahtar kelimeleri ve reklam metinlerini hazırlar, telefon ve form dönüşümlerini ölçer, düzenli olarak iyileştiririz.</p>
            <Link href="/hizmetler/google-ads-yonetimi" className="ui mt-6 inline-block border-b-2 border-murekkep pb-0.5 hover:border-emaye hover:text-emaye">Google Ads yönetimi</Link>
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="ui text-sm text-soluk">Panel ve destek</p>
            <h3 className="display mt-2 text-3xl text-emaye">Her şey tek panelde</h3>
            <p className="mt-4 text-lg">Projenizin hangi aşamada olduğunu görür, önizlemeyi onaylar, destek talebi açar, ödemelerinizi ve faturalarınızı indirirsiniz.</p>
            <Link href="/hizmetler/bakim-ve-destek" className="ui mt-6 inline-block border-b-2 border-murekkep pb-0.5 hover:border-emaye hover:text-emaye">Bakım ve destek</Link>
          </div>
          <PanelMock />
        </div>
      </section>

      {/* 4. Süreç */}
      <section className="on-gece bg-gece text-beyaz">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <SectionHead light title="Dört adımda yayında" lead="Siz yalnızca bilgilerinizi ve onayınızı verirsiniz." />
          <ol className="mt-12 grid gap-px bg-beyaz/20 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="bg-gece p-7">
                <span className="display text-5xl text-tabela">{i + 1}</span>
                <h3 className="ui mt-5 text-xl">{s.title}</h3>
                <p className="mt-3 text-beyaz/75">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/nasil-calisir" className="ui mt-10 inline-block border-b-2 border-tabela pb-0.5 text-tabela hover:text-beyaz">Süreci ayrıntılı oku</Link>
        </div>
      </section>

      {/* 5. Örnek tasarımlar */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <SectionHead title="Farklı sektörler, farklı yüzler" lead="Her site firmasına göre tasarlanır. Aşağıdakiler örnek tasarımdır, müşteri çalışması değildir." />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {(["mobilya", "hukuk", "klinik"] as const).map((v) => (
            <figure key={v}>
              <SiteMock variant={v} compact />
              <figcaption className="mt-3 text-sm text-soluk">Örnek tasarım</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8"><Link href="/referanslar" className="ui border-b-2 border-murekkep pb-0.5 hover:border-emaye hover:text-emaye">Referanslar</Link></p>
      </section>

      {/* 6. Paketler */}
      <section className="border-y border-cizgi bg-kagit">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <SectionHead title="Paketler ve fiyatlar" lead="Abonelik paketlerinde fiyat aylıktır ve taahhüt 12 aydır; tek seferlik paketlerde bir kez ödersiniz. Reklam bütçesi fiyata dahil değildir." />
          <div className="mt-12"><PackageGrid packages={packages} /></div>
          <p className="mt-8 max-w-3xl text-soluk">Bedel her ay kartınızdan iyzico aracılığıyla otomatik çekilir. 12 ay içinde memnun kalmazsanız panelden iptal talebi açabilirsiniz; talep ekibimizce değerlendirilir. <Link href="/yasal/iptal-iade" className="underline underline-offset-4">İptal ve iade koşulları</Link></p>
        </div>
      </section>

      {/* 7. Blog */}
      {posts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead title="Blogdan" lead="Web sitesi ve Google Ads hakkında, işinize yarayacak yazılar." />
            <Link href="/blog" className="ui border-b-2 border-murekkep pb-0.5 hover:border-emaye hover:text-emaye">Tüm yazılar</Link>
          </div>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group block h-full border border-cizgi bg-beyaz p-6 hover:border-emaye">
                  <p className="ui text-sm text-emaye">{p.category}</p>
                  <h3 className="ui mt-3 text-xl leading-snug group-hover:underline group-hover:underline-offset-4">{p.title}</h3>
                  <p className="mt-3 text-soluk">{p.excerpt}</p>
                  <p className="mt-5 text-sm text-soluk">{formatPostDate(p.publishedAt)} · {p.readingMinutes} dk okuma</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 8. SSS: ortalı tek sütun */}
      <section className="mx-auto max-w-3xl px-5 pb-20 md:pb-28">
        <div className="text-center">
          <h2 className="display text-3xl text-emaye sm:text-4xl">Sık sorulanlar</h2>
          <p className="mt-4 text-soluk">
            Cevabını bulamadığınız soru için <Link href="/iletisim" className="underline underline-offset-4">bize yazın</Link>.
          </p>
        </div>
        <div className="mt-10">
          <Faq items={faqItems.slice(0, 6)} />
        </div>
        <p className="mt-6 text-center">
          <Link href="/sss" className="ui border-b-2 border-murekkep pb-0.5 hover:border-emaye hover:text-emaye">Tüm sorular</Link>
        </p>
      </section>

      <CtaBand />
    </>
  );
}
