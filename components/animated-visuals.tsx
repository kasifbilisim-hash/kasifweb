import { BrowserFrame } from "./visuals";

/*
 * Ana sayfa ilk ekranındaki hareketli sahne: bir site adım adım kurulur, imleç düğmeye tıklar; reklamlı pakette
 * bir Google reklamı yazılarak belirir ve anahtar kelimeler tek tek eklenir. Yalnızca CSS animasyonudur
 * (globals.css, "an-" önekli sınıflar); sürekli döngüde, her öğe kendi gecikmesiyle. Taban stil son görünümdür:
 * "hareketi azalt" tercihinde animasyonlar kapanır ve tamamlanmış sahne durur. Rakam ve istatistik yok.
 */

type Variant = "mobilya" | "hukuk" | "klinik";

const THEMES: Record<Variant, { bg: string; ink: string; accent: string; soft: string; cta: string; ctaText: string; name: string; url: string; serif: boolean; adTitle: string; keywords: string[] }> = {
  mobilya: {
    bg: "#f4ece1", ink: "#2b1d14", accent: "#b4552d", soft: "#e6d6c0", cta: "Kataloğu incele", ctaText: "#fff", name: "Meşe Atölye", url: "meseatolye.example", serif: true,
    adTitle: "Ofis Masası ve Sandalye | Yerinde Ölçü",
    keywords: ["ofis masası imalatı", "toplantı masası ölçüye göre", "restoran sandalyesi toptan"],
  },
  hukuk: {
    bg: "#10213a", ink: "#f2efe8", accent: "#c9a24b", soft: "#1b3354", cta: "Randevu alın", ctaText: "#10213a", name: "Yıldız Hukuk Bürosu", url: "yildizhukuk.example", serif: true,
    adTitle: "Ticaret Hukuku Avukatı | Randevu Alın",
    keywords: ["ticaret hukuku avukatı", "sözleşme hazırlama", "iş hukuku danışmanlığı"],
  },
  klinik: {
    bg: "#eef7f6", ink: "#0e3b3a", accent: "#0f8b86", soft: "#d3ecea", cta: "Randevu al", ctaText: "#fff", name: "Deniz Diş Kliniği", url: "denizklinik.example", serif: false,
    adTitle: "Diş Kliniği | Hemen Randevu Alın",
    keywords: ["implant diş fiyatları", "diş beyazlatma", "çocuk diş hekimi"],
  },
};

const d = (s: number) => ({ animationDelay: `${s}s` });

export function HeroScene({ variant, ads = false, tilt = -1.5 }: { variant: Variant; ads?: boolean; tilt?: number }) {
  const t = THEMES[variant];
  const font = t.serif ? "Georgia, 'Times New Roman', serif" : "system-ui, sans-serif";

  return (
    <figure className="an mx-auto w-full max-w-xl pr-4">
      {/* Reklam kartı bu kutunun altına yaslanır; açıklama yazısı kutunun dışında, kartın altında kalır */}
      <div aria-hidden="true" className={`relative ${ads ? "pb-32" : "pb-4"}`}>
        <div className="an-float" style={{ rotate: `${tilt}deg` }}>
          <BrowserFrame url={t.url}>
            <div style={{ background: t.bg, color: t.ink, fontFamily: font }} className="p-3 sm:p-4">
              {/* Üst çubuk */}
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: t.accent + "55" }}>
                <strong className="an-pop text-[10px] sm:text-xs" style={d(0)}>{t.name}</strong>
                <span className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <i key={i} className="an-grow block h-1.5 w-8" style={{ background: t.ink + "55", ...d(0.3 + i * 0.15) }} />
                  ))}
                </span>
              </div>

              {/* Başlık ve düğme */}
              <div className="py-5">
                <div className="an-grow h-3.5 w-4/5 sm:h-4" style={{ background: t.ink, ...d(0.7) }} />
                <div className="an-grow mt-2 h-3.5 w-3/5 sm:h-4" style={{ background: t.ink, ...d(0.9) }} />
                <div className="an-grow mt-3 h-2 w-2/3" style={{ background: t.ink + "66", ...d(1.1) }} />
                <span className="relative mt-4 inline-block">
                  <span className="an-pop inline-block" style={d(1.3)}>
                    <span className="an-press inline-block px-3 py-1.5 text-[10px] font-bold sm:text-xs" style={{ background: t.accent, color: t.ctaText, ...d(1.3) }}>
                      {t.cta}
                    </span>
                  </span>
                  <svg className="an-cursor pointer-events-none absolute left-9 top-3 h-5 w-5" viewBox="0 0 20 20" style={d(1.3)}>
                    <path d="M3 2l12 7-5.5 1.3L7.5 16z" fill="#1a1a18" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              {/* Kartlar */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="an-rise p-2" style={{ background: t.soft, borderTop: `3px solid ${t.accent}`, ...d(1.7 + i * 0.2) }}>
                    <div className="h-6 sm:h-8" style={{ background: t.accent + (i === 1 ? "55" : "33") }} />
                    <div className="mt-2 h-1.5 w-3/4" style={{ background: t.ink + "66" }} />
                  </div>
                ))}
              </div>
            </div>
          </BrowserFrame>
        </div>

        {/* Reklam kartı */}
        {ads ? (
          <div className="an-float-b absolute bottom-0 right-0 w-[66%]" style={{ rotate: "2deg" }}>
            <div className="an-slide border-2 border-murekkep bg-beyaz p-3 text-murekkep shadow-[8px_8px_0_#f2b705]" style={d(1.6)}>
              <p className="text-[10px] text-soluk">
                <strong className="text-murekkep">Reklam</strong> · {t.url}
              </p>
              <p className="mt-1 overflow-hidden text-sm leading-snug text-[#1a0dab] sm:text-base">
                <span className="an-type inline-block overflow-hidden whitespace-nowrap align-bottom" style={{ ["--ch" as string]: t.adTitle.length + 1, ...d(2.2) }}>
                  {t.adTitle}
                </span>
              </p>
              <div className="an-grow mt-1.5 h-2 w-full bg-cizgi" style={d(3.1)} />
              <div className="an-grow mt-1 h-2 w-4/5 bg-cizgi" style={d(3.25)} />
              <div className="mt-2 flex gap-2 text-[10px]">
                {["Ara", "WhatsApp"].map((c, i) => (
                  <span key={c} className="an-pop border border-cizgi px-2 py-0.5" style={d(3.6 + i * 0.2)}>{c}</span>
                ))}
              </div>
              <ul className="mt-3 space-y-1 border-t border-cizgi pt-2 text-xs">
                {t.keywords.map((k, i) => (
                  <li key={k} className="an-slide-l flex items-center gap-2" style={d(4.1 + i * 0.35)}>
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-emaye"><circle cx="8" cy="8" r="7" fill="currentColor" /><path d="M4.5 8.3l2.3 2.3 4.7-4.9" fill="none" stroke="#fff" strokeWidth="1.8" /></svg>
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
      <figcaption className="mt-6 text-sm text-beyaz/60">
        Örnek tasarım{ads ? " ve örnek reklam" : ""} animasyonu. Müşteri çalışması değildir.
      </figcaption>
    </figure>
  );
}
