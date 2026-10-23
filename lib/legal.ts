// Onay kaydı için belge versiyonları. Yasal metin (lib/legal-docs.ts) değiştiğinde versiyonu artır:
// eski kayıtlar eski versiyonu göstermeye devam eder.
export const AGREEMENT_VERSIONS = {
  mesafeli_satis: "v1-2026-10",
  on_bilgilendirme: "v1-2026-10",
  kvkk: "v1-2026-10",
} as const;

export const LEGAL_UPDATED = "23 Ekim 2026";

export const AGREEMENTS = [
  { type: "mesafeli_satis", title: "Mesafeli satış sözleşmesi", label: "Mesafeli satış sözleşmesini", href: "/yasal/mesafeli-satis" },
  { type: "on_bilgilendirme", title: "Ön bilgilendirme formu", label: "Ön bilgilendirme formunu", href: "/yasal/on-bilgilendirme" },
  { type: "kvkk", title: "KVKK aydınlatma metni", label: "KVKK aydınlatma metnini", href: "/yasal/kvkk" },
] as const;

export const COMMITMENT_MONTHS = 12;
