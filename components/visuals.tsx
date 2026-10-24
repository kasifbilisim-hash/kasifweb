import type { ReactNode } from "react";

/*
 * Ürünü gösteren çizimler. Hepsi HTML/CSS: stok fotoğraf yok, uydurma rakam yok. Müşteri siteleri değil,
 * "örnek tasarım"dır ve sayfada öyle etiketlenir. Ekran okuyucular için figure + figcaption kullanılır.
 */

export function BrowserFrame({ url, children, className = "" }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden border-2 border-murekkep bg-beyaz text-murekkep ${className}`} aria-hidden="true">
      <div className="flex items-center gap-2 border-b-2 border-murekkep bg-kagit px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-murekkep/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-murekkep/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-murekkep/20" />
        <span className="ml-2 min-w-0 flex-1 truncate border border-cizgi bg-beyaz px-2 py-0.5 text-[11px] text-soluk">{url}</span>
      </div>
      {children}
    </div>
  );
}

type Variant = "mobilya" | "hukuk" | "klinik";

const THEMES: Record<Variant, { bg: string; ink: string; accent: string; soft: string; name: string; hero: string; cta: string; tiles: string[]; url: string; serif: boolean }> = {
  mobilya: { bg: "#f4ece1", ink: "#2b1d14", accent: "#b4552d", soft: "#e6d6c0", name: "Meşe Atölye", hero: "El işçiliği masa ve sandalye", cta: "Kataloğu incele", tiles: ["Masalar", "Sandalyeler", "Dolaplar"], url: "meseatolye.example", serif: true },
  hukuk: { bg: "#10213a", ink: "#f2efe8", accent: "#c9a24b", soft: "#1b3354", name: "Yıldız Hukuk Bürosu", hero: "Ticaret ve iş hukukunda danışmanlık", cta: "Randevu alın", tiles: ["Ticaret hukuku", "İş hukuku", "Sözleşmeler"], url: "yildizhukuk.example", serif: true },
  klinik: { bg: "#eef7f6", ink: "#0e3b3a", accent: "#0f8b86", soft: "#d3ecea", name: "Deniz Diş Kliniği", hero: "Sağlıklı gülüşler için randevu", cta: "Randevu al", tiles: ["İmplant", "Estetik", "Çocuk"], url: "denizklinik.example", serif: false },
};

/** Örnek site tasarımı. Her varyant farklı renk, yazı karakteri ve yerleşimde. */
export function SiteMock({ variant, compact = false }: { variant: Variant; compact?: boolean }) {
  const t = THEMES[variant];
  const font = t.serif ? "Georgia, 'Times New Roman', serif" : "system-ui, sans-serif";
  return (
    <BrowserFrame url={t.url}>
      <div style={{ background: t.bg, color: t.ink, fontFamily: font }} className="p-3 sm:p-4">
        <div className="flex items-center justify-between border-b pb-2 text-[10px] sm:text-xs" style={{ borderColor: t.accent + "55" }}>
          <strong style={{ letterSpacing: variant === "hukuk" ? "0.08em" : 0 }}>{t.name}</strong>
          <span className="hidden gap-3 opacity-80 sm:flex"><span>Hizmetler</span><span>Hakkımızda</span><span>İletişim</span></span>
        </div>
        <div className={`grid items-center gap-3 ${compact ? "py-4" : "py-6"} ${variant === "klinik" ? "grid-cols-[1.2fr_1fr]" : "grid-cols-1"}`}>
          <div>
            <p className={`${compact ? "text-base" : "text-lg sm:text-2xl"} leading-tight`} style={{ fontWeight: t.serif ? 700 : 800 }}>{t.hero}</p>
            <p className="mt-2 text-[10px] opacity-75 sm:text-xs">Randevu ve bilgi için bize ulaşın.</p>
            <span className="mt-3 inline-block px-3 py-1.5 text-[10px] font-bold sm:text-xs" style={{ background: t.accent, color: variant === "hukuk" ? "#10213a" : "#fff" }}>{t.cta}</span>
          </div>
          {variant === "klinik" ? <div className="aspect-[4/3]" style={{ background: t.soft, borderRadius: "40% 8px 8px 8px" }} /> : null}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {t.tiles.map((x, i) => (
            <div key={x} className="p-2 text-[10px] font-bold sm:text-xs" style={{ background: t.soft, borderTop: `3px solid ${t.accent}` }}>
              <div className="mb-3 h-6 sm:h-8" style={{ background: t.accent + (i === 1 ? "55" : "33") }} />
              {x}
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

/** Google arama sonucu reklamı ve anahtar kelime listesi (örnek). */
export function AdsMock() {
  return (
    <div className="border-2 border-murekkep bg-beyaz p-4 text-murekkep" aria-hidden="true">
      <p className="ui text-xs text-soluk">Arama sonucu (örnek)</p>
      <div className="mt-3 border border-cizgi p-3">
        <p className="text-xs"><strong>Reklam</strong> · meseatolye.example</p>
        <p className="mt-1 text-lg leading-snug text-[#1a0dab]">Ofis Masası ve Sandalye | Yerinde Ölçü</p>
        <p className="text-sm text-soluk">El işçiliği, ölçüye özel üretim. Keşif ve fiyat için hemen arayın.</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="border border-cizgi px-2 py-0.5">Ara</span>
          <span className="border border-cizgi px-2 py-0.5">Yol tarifi</span>
          <span className="border border-cizgi px-2 py-0.5">WhatsApp</span>
        </div>
      </div>
      <p className="ui mt-4 text-xs text-soluk">Hedeflenen aramalar (örnek)</p>
      <ul className="mt-2 grid gap-1 text-sm">
        {["ofis masası imalatı", "toplantı masası ölçüye göre", "restoran sandalyesi toptan"].map((k) => (
          <li key={k} className="flex items-center justify-between border-b border-cizgi py-1.5">
            <span>{k}</span>
            <span className="text-xs text-soluk">tam eşleşme</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Müşteri panelinden proje takibi (örnek). */
export function PanelMock() {
  const steps: [string, "tamam" | "simdi" | "bekliyor"][] = [
    ["Bilgiler ve taahhütname", "tamam"],
    ["Tasarım", "tamam"],
    ["Onayınız", "simdi"],
    ["Geliştirme", "bekliyor"],
    ["Yayın", "bekliyor"],
  ];
  return (
    <BrowserFrame url="kasifyazilim.com.tr/panel/proje">
      <div className="grid gap-4 bg-kagit p-4 sm:grid-cols-[1fr_1.1fr]">
        <ol className="space-y-1.5 border-l-4 border-murekkep text-sm">
          {steps.map(([label, s]) => (
            <li key={label} className={`-ml-1 border-l-4 py-1.5 pl-3 ${s === "simdi" ? "border-tabela bg-tabela-acik font-bold" : s === "tamam" ? "border-emaye" : "border-transparent text-soluk"}`}>
              {label}
              {s === "tamam" ? <span className="text-emaye"> ✓</span> : null}
            </li>
          ))}
        </ol>
        <div className="border-2 border-murekkep bg-beyaz p-3 text-sm">
          <p className="ui">Tasarım onayınızı bekliyor</p>
          <p className="mt-1 text-xs text-soluk">Önizlemeyi açın, beğenirseniz onaylayın ya da revizyon isteyin.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="bg-emaye px-3 py-1.5 text-xs font-bold text-beyaz">Onayla</span>
            <span className="border-2 border-murekkep px-3 py-1.5 text-xs font-bold">Revizyon iste</span>
          </div>
          <div className="mt-4 border-t border-cizgi pt-3 text-xs text-soluk">
            <p className="ui text-murekkep">Geçmiş</p>
            <p className="mt-1">Tasarım hazır, onayınızı bekliyoruz.</p>
            <p>Taahhütnameniz onaylandı, tasarıma geçtik.</p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

/** Basit çizgi pictogramlar: aynı kalınlık ve ızgarada, yalnızca anlamı olan yerde kullanılır. */
export function Pictogram({ name, className = "h-7 w-7" }: { name: "alan" | "kart" | "iptal" | "panel" | "tasarim" | "reklam" | "bakim" | "arama"; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "square" as const, strokeLinejoin: "miter" as const };
  const paths: Record<string, ReactNode> = {
    alan: (<><circle cx="12" cy="12" r="9" {...common} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" {...common} /></>),
    kart: (<><rect x="2.5" y="5" width="19" height="14" {...common} /><path d="M2.5 10h19M6 15h4" {...common} /></>),
    iptal: (<><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" {...common} /></>),
    panel: (<><rect x="3" y="4" width="18" height="16" {...common} /><path d="M3 9h18M8 9v11" {...common} /></>),
    tasarim: (<><rect x="3" y="4" width="18" height="14" {...common} /><path d="M8 21h8M12 18v3M7 9h6M7 13h10" {...common} /></>),
    reklam: (<><path d="M3 11v4l12 4V7L3 11zM15 9a4 4 0 0 1 0 6M7 15v4" {...common} /></>),
    bakim: (<><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5z" {...common} /></>),
    arama: (<><circle cx="10.5" cy="10.5" r="6.5" {...common} /><path d="M15.5 15.5L21 21" {...common} /></>),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
