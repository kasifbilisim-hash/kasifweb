// Referans siteler. Yalnızca ad, adres ve ana sayfa ekran görüntüsü tutulur; ne yapıldığına dair iddia eklenmez
// (doğrulanmış bilgi gelince eklenir). Görüntüler public/referanslar altında, 1280x800, tarih: 23 Ekim 2026.
export type Reference = { name: string; host: string; image: string };

export const references: Reference[] = [
  { name: "ProTec Güvenlik", host: "protecguvenlik.com.tr", image: "/referanslar/protec-guvenlik.jpg" },
  { name: "Araç Nakliyecim", host: "aracnakliyecim.com", image: "/referanslar/arac-nakliyecim.jpg" },
  { name: "Oto Taşıma", host: "ototasima.com", image: "/referanslar/oto-tasima.jpg" },
  { name: "Holiday Teams", host: "holidayteams.com", image: "/referanslar/holiday-teams.jpg" },
  { name: "Halka Arz Takip", host: "halkaarztakip.site", image: "/referanslar/halka-arz-takip.jpg" },
  { name: "Tarsus Tesisatçı", host: "tarsustesisatci.com", image: "/referanslar/tarsus-tesisatci.jpg" },
];
