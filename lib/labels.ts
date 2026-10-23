// Panel ve yönetim ekranlarında ortak Türkçe etiketler.
export const SUB_STATUS: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  active: "Aktif",
  payment_failed: "Ödeme alınamadı",
  cancel_requested: "İptal talebi",
  cancelled: "İptal edildi",
  expired: "Süresi doldu",
};

export const PAYMENT_STATUS: Record<string, string> = {
  success: "Ödendi",
  failed: "Alınamadı",
  pending: "Bekliyor",
  refunded: "İade edildi",
};

export const STAGE_LABEL: Record<string, string> = {
  bilgi_bekleniyor: "Bilgi bekleniyor",
  taahhutname_bekleniyor: "Taahhütname bekleniyor",
  tasarim: "Tasarım",
  musteri_onayi: "Müşteri onayı",
  gelistirme: "Geliştirme",
  yayinda: "Yayında",
  sonlandirildi: "Sonlandırıldı",
};

export const COMMITMENT_LABEL: Record<string, string> = {
  bekliyor: "Müşteri indirip imzalayacak",
  yuklendi: "Onay bekliyor",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};
