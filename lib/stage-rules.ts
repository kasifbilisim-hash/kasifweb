const ORDER = ["bilgi_bekleniyor", "taahhutname_bekleniyor", "tasarim", "musteri_onayi", "gelistirme", "yayinda"] as const;

/**
 * Yönetici aşama değişikliği kuralları. Taahhütname onaylanmadan "tasarim" ve sonrasına geçilmez
 * (CLAUDE.md), önizleme adresi olmadan müşteriye onay istenemez. Hata varsa mesajı döner.
 */
export function checkStageChange(args: {
  to: (typeof ORDER)[number];
  commitmentApproved: boolean;
  previewUrl: string | null;
}): string | null {
  if (ORDER.indexOf(args.to) >= ORDER.indexOf("tasarim") && !args.commitmentApproved) {
    return "Taahhütname onaylanmadan proje tasarım aşamasına ve sonrasına geçemez.";
  }
  if (args.to === "musteri_onayi" && !args.previewUrl) {
    return "Müşteriden onay istemek için önizleme adresi girin.";
  }
  return null;
}
