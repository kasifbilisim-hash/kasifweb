import { CallButton, PhoneIcon, WhatsAppButton, WhatsAppIcon } from "./contact-buttons";
import { DEFAULT_WA_MESSAGE, getContact } from "@/lib/contact";

/*
 * Her sayfada, her ekran genişliğinde altta sabit iletişim çubuğu (üst menü gibi yerinde durur).
 * Telefonda: tam genişlikte iki düğme (Ara | WhatsApp). Tablet ve masaüstünde: sayfa genişliğinde ince bir bar,
 * solda çağrı cümlesi, sağda numara ve WhatsApp düğmesi. Altındaki boşluk, içeriğin çubuğun altında kalmaması içindir.
 * Numara girilmemişse hiçbir şey gösterilmez. Kepenk animasyonlarının (z-90/100) altında kalır.
 */
export function FloatingContact() {
  const c = getContact();
  const wa = c.wa(DEFAULT_WA_MESSAGE);
  if (!c.tel && !wa) return null;

  return (
    <>
      <div className="h-14 md:h-[4.25rem]" aria-hidden="true" />
      <nav aria-label="Hızlı iletişim" className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-murekkep bg-beyaz">
        {/* Telefon */}
        <div className="grid grid-cols-2 md:hidden">
          {c.tel ? (
            <a href={c.tel} className="ui flex items-center justify-center gap-2 bg-tabela py-3.5 text-murekkep">
              <PhoneIcon /> Ara
            </a>
          ) : <span />}
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="ui flex items-center justify-center gap-2 bg-emaye py-3.5 text-beyaz">
              <WhatsAppIcon /> WhatsApp<span className="sr-only"> (yeni sekmede açılır)</span>
            </a>
          ) : <span />}
        </div>

        {/* Tablet ve masaüstü */}
        <div className="mx-auto hidden max-w-6xl items-center justify-between gap-6 px-5 py-2.5 md:flex">
          <p className="ui text-[0.95rem]">Paketler ve fiyatlar için bizi arayın ya da WhatsApp&apos;tan yazın.</p>
          <div className="flex items-center gap-3">
            <CallButton surface="light" size="sm" showNumber />
            <WhatsAppButton surface="light" size="sm" label="WhatsApp" />
          </div>
        </div>
      </nav>
    </>
  );
}
