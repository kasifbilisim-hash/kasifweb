const LINE_SEP = new RegExp(String.fromCharCode(0x2028), "g");
const PARA_SEP = new RegExp(String.fromCharCode(0x2029), "g");

/**
 * JSON-LD'yi script etiketi içine güvenle basmak için serileştirir. JSON.stringify "<" karakterini kaçışlamaz;
 * yönetimden girilen bir başlıkta kapanış etiketi geçerse betikten çıkılıp HTML enjekte edilebilirdi.
 * "<", ">" ve "&" ile satır/paragraf ayırıcıları unicode kaçışına çevrilir; JSON olarak anlamı değişmez.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEP, "\\u2028")
    .replace(PARA_SEP, "\\u2029");
}
