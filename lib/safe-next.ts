/** Giriş sonrası yönlendirme hedefi. Yalnızca site içi mutlak yola izin verir (open redirect'i önler). */
export function safeNext(value: string | null | undefined, fallback = "/panel"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
