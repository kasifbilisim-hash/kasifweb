const MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

/** "Kurumsal Web Sitesi + Ads" -> "kurumsal-web-sitesi-ads". Türkçe karakterleri ASCII'ye çevirir. */
export function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (c) => MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
