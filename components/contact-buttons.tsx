import { DEFAULT_WA_MESSAGE, getContact } from "@/lib/contact";

/*
 * Sitenin tek amacı: telefon araması ya da WhatsApp yönlendirmesi. Bütün çağrı düğmeleri buradan gelir.
 * surface: düğmenin durduğu zemin (light: açık, dark: koyu yeşil, yellow: sarı bant).
 */

export function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M12 2.5a9.5 9.5 0 0 0-8.1 14.4L2.5 21.5l4.7-1.3A9.5 9.5 0 1 0 12 2.5z" />
      <path
        fill="currentColor"
        transform="translate(6.2 6.2) scale(0.5)"
        d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
      />
    </svg>
  );
}

export type Surface = "light" | "dark" | "yellow";
type Size = "lg" | "md" | "sm";

const SIZE: Record<Size, string> = {
  lg: "gap-3 px-7 py-4 text-lg",
  md: "gap-2.5 px-5 py-3 text-base",
  sm: "gap-2 px-4 py-2.5 text-[0.95rem]",
};
const CALL: Record<Surface, string> = {
  light: "bg-tabela text-murekkep hover:bg-murekkep hover:text-beyaz",
  dark: "bg-tabela text-murekkep hover:bg-beyaz",
  yellow: "bg-murekkep text-beyaz hover:bg-emaye",
};
const WA: Record<Surface, string> = {
  light: "bg-emaye text-beyaz hover:bg-murekkep",
  dark: "border-2 border-beyaz/60 text-beyaz hover:bg-beyaz hover:text-gece",
  yellow: "border-2 border-murekkep text-murekkep hover:bg-murekkep hover:text-beyaz",
};

const base = "ui inline-flex items-center justify-center whitespace-nowrap";

function Missing({ size }: { size: Size }) {
  return (
    <span className={`${base} ${SIZE[size]} border-2 border-dashed border-current text-sm opacity-70`}>
      Telefon numarası eklenecek
    </span>
  );
}

export function CallButton({ surface = "light", size = "lg", label = "Hemen ara", showNumber = false }: { surface?: Surface; size?: Size; label?: string; showNumber?: boolean }) {
  const c = getContact();
  if (!c.tel) return <Missing size={size} />;
  return (
    <a href={c.tel} className={`${base} ${SIZE[size]} ${CALL[surface]}`}>
      <PhoneIcon />
      <span>{label}</span>
      {showNumber && c.phoneText ? <span className="hidden font-normal opacity-80 sm:inline">{c.phoneText}</span> : null}
    </a>
  );
}

export function WhatsAppButton({ surface = "light", size = "lg", label = "WhatsApp'tan yazın", message = DEFAULT_WA_MESSAGE }: { surface?: Surface; size?: Size; label?: string; message?: string }) {
  const href = getContact().wa(message);
  if (!href) return null; // numara yoksa telefon düğmesi zaten "numara eklenecek" der
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${SIZE[size]} ${WA[surface]}`}>
      <WhatsAppIcon />
      <span>{label}</span>
      <span className="sr-only"> (yeni sekmede açılır)</span>
    </a>
  );
}

/** Yan yana Ara + WhatsApp. */
export function ContactPair({ surface = "light", size = "lg", message = DEFAULT_WA_MESSAGE }: { surface?: Surface; size?: Size; message?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <CallButton surface={surface} size={size} />
      <WhatsAppButton surface={surface} size={size} message={message} />
    </div>
  );
}
