import Image from "next/image";

/*
 * Kaşif Yazılım logosu: markanın kendi tasarımı (public/logo). Orijinalden şeffaf parçalara ayrıldı:
 *   isaret-*  K işareti (392x365)      yazi-*  KAŞİF + YAZILIM yazısı (748x272)      tam-*  üst üste tam logo (748x675)
 * Renkler: koyu (marka yeşili), beyaz, sari (tabela sarısı). Koyu zeminde işaret sarı, yazı beyaz kullanılır.
 */
export type LogoColor = "koyu" | "beyaz" | "sari";

const MARK = { w: 392, h: 365 };
const WORD = { w: 748, h: 272 };

export function LogoMark({ height = 40, color = "koyu", priority = false }: { height?: number; color?: LogoColor; priority?: boolean }) {
  return (
    <Image
      src={`/logo/isaret-${color}.png`}
      alt=""
      width={MARK.w}
      height={MARK.h}
      priority={priority}
      style={{ height, width: "auto" }}
      className="shrink-0"
      aria-hidden="true"
    />
  );
}

export function LogoWord({ height = 40, color = "koyu", priority = false }: { height?: number; color?: LogoColor; priority?: boolean }) {
  return (
    <Image
      src={`/logo/yazi-${color}.png`}
      alt=""
      width={WORD.w}
      height={WORD.h}
      priority={priority}
      style={{ height, width: "auto" }}
      className="shrink-0"
      aria-hidden="true"
    />
  );
}

/** Yan yana: işaret + yazı. light: koyu zeminde (sarı işaret, beyaz yazı). Erişilebilir ad tek yerde verilir. */
export function Logo({ light = false, height = 44, priority = false }: { light?: boolean; height?: number; priority?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3" role="img" aria-label="Kaşif Yazılım">
      <Image
        src={`/logo/isaret-${light ? "sari" : "koyu"}.png`}
        alt=""
        width={MARK.w}
        height={MARK.h}
        priority={priority}
        style={{ height, width: "auto" }}
        aria-hidden="true"
      />
      <Image
        src={`/logo/yazi-${light ? "beyaz" : "koyu"}.png`}
        alt=""
        width={WORD.w}
        height={WORD.h}
        priority={priority}
        style={{ height: Math.round(height * 0.92), width: "auto" }}
        aria-hidden="true"
      />
    </span>
  );
}
