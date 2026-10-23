import { LogoMark, LogoWord } from "./logo";

const SLATS = 26;

/*
 * Açılış ekranı: esnaf dükkânının kepenği. Sayfa ilk açıldığında kapalı görünür, kısa bir beklemeden sonra
 * yukarı kayarak siteyi açar. Yalnızca CSS animasyonudur (JavaScript gerekmez, içerik DOM'da hazırdır,
 * tıklamayı engellemez). Oturum başına bir kez gösterilir: (site)/layout.tsx'teki küçük betik, daha önce
 * gösterildiyse <html>'e "kepenk-yok" sınıfı ekler. "Hareketi azalt" tercihinde hiç gösterilmez.
 */
export function Kepenk() {
  return (
    <div className="kepenk" aria-hidden="true">
      <div className="flex h-full flex-col">
        {Array.from({ length: SLATS }, (_, i) => (
          <div key={i} className={`kepenk-lama ${i % 2 === 0 ? "kepenk-lama-a" : "kepenk-lama-b"}`} />
        ))}
      </div>

      {/* Kepenğin üstündeki yazı: dükkân tabelası */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-5 border-4 border-tabela bg-gece px-10 py-8 text-center shadow-[8px_8px_0_#0a2319] sm:px-12 sm:py-8">
          <LogoMark height={84} color="sari" priority />
          <LogoWord height={64} color="beyaz" priority />
        </div>
      </div>

      {/* Kulp ve kilit: kepenkle birlikte yukarı çıkar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <div className="relative h-5 w-44 bg-tabela">
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gece" />
        </div>
        <div className="mx-auto h-2 w-48 bg-murekkep" />
      </div>
    </div>
  );
}
