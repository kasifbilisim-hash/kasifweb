import { site } from "@/lib/site";

/*
 * Telefon ve WhatsApp yönlendirmesi. Numaralar yalnızca lib/site.ts içindeki `site.phone` ve `site.whatsapp`
 * alanlarından gelir. whatsapp boş bırakılırsa telefonla aynı numara kullanılır. Numara girilmemişse (yer tutucu)
 * bağlantılar üretilmez; düğmeler "numara eklenecek" diye görünür, kırık bağlantı çıkmaz.
 */

export const isPlaceholder = (v: string) => v.trim() === "" || v.includes("[İÇERİK");

/** "0 (555) 123 45 67", "+90 555 123 4567", "555 123 45 67" -> "905551234567". Tanınmayan biçimde null. */
export function normalizePhone(input: string): string | null {
  let n = input.replace(/\D/g, "");
  if (!n) return null;
  if (n.startsWith("00")) n = n.slice(2);
  if (n.length === 12 && n.startsWith("90")) return n;
  if (n.length === 11 && n.startsWith("0")) return "90" + n.slice(1);
  if (n.length === 10) return "90" + n;
  return n.length >= 11 && n.length <= 15 ? n : null; // başka ülke numarası
}

export const DEFAULT_WA_MESSAGE = "Merhaba, web sitesi ve Google Ads paketleri hakkında bilgi almak istiyorum.";
export const packageWaMessage = (name: string) => `Merhaba, "${name}" hakkında bilgi almak istiyorum.`;

export type Contact = {
  /** Ekranda gösterilen numara metni (yazıldığı biçimde), yoksa null */
  phoneText: string | null;
  /** tel: bağlantısı, yoksa null */
  tel: string | null;
  /** wa.me bağlantısı (isteğe bağlı hazır mesajla), numara yoksa null */
  wa: (message?: string) => string | null;
};

export function getContact(): Contact {
  const phone = isPlaceholder(site.phone) ? null : normalizePhone(site.phone);
  const waSource = site.whatsapp.trim() === "" ? site.phone : site.whatsapp;
  const wa = isPlaceholder(waSource) ? null : normalizePhone(waSource);
  return {
    phoneText: phone ? site.phone : null,
    tel: phone ? `tel:+${phone}` : null,
    wa: (message) => (wa ? `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}` : null),
  };
}
