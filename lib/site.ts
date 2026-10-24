export const site = {
  name: "Kaşif Yazılım",
  url: "https://kasifyazilim.com.tr",
  description:
    "Kurumsal web sitenizi ve Google reklamlarınızı abonelik ya da tek seferlik paketle kuruyor ve yönetiyoruz.",
  email: "info@kasifbilisim.com.tr",
  phone: "+90 549 100 34 27",
  // WhatsApp için ayrı numara gerekirse buraya yazın; boşsa telefonla aynı numara kullanılır.
  whatsapp: "",
  address: "ŞAHİNTEPE MAH. 133383 NOLU CAD. UĞUR ÇARŞI A BLOK NO: 6 A/D ŞAHİNBEY/GAZİANTEP",
} as const;

/**
 * Hizmet sağlayıcının resmi kimlik bilgileri: sözleşmelerde, ön bilgilendirmede, KVKK metninde ve
 * taahhütnamede aynen kullanılır. Gerçek bilgiler yalnızca BURADAN girilir; hukuki metinlerin geri kalanı hazırdır.
 */
export const company = {
  tradeName: "Kaşif Yazılım",
  legalName: "Serhat Akçakıl",
  mersis: "", // şahıs işletmesi: MERSİS yok
  taxOffice: "Şahinbey",
  taxNumber: "", // şahıs işletmesi: T.C. kimlik no kesinlikle yayımlanmaz,
  address: "ŞAHİNTEPE MAH. 133383 NOLU CAD. UĞUR ÇARŞI A BLOK NO: 6 A/D ŞAHİNBEY/GAZİANTEP",
  kep: "",
  phone: "+90 549 100 34 27",
  email: "info@kasifbilisim.com.tr",
  website: "kasifyazilim.com.tr",
} as const;

/** Taahhütnamede ve sözleşmelerde tek satırda gösterilen kimlik. */
export const companyLine = `${company.legalName} (${company.tradeName}), Vergi Dairesi: ${company.taxOffice}${company.taxNumber ? ` / ${company.taxNumber}` : ""}${company.mersis ? `, MERSİS: ${company.mersis}` : ""}, Adres: ${company.address}`;

/**
 * Özellik anahtarları. blog: false iken /blog ve yazı sayfaları 404 verir; menüde, alt bilgide, ana sayfada ve
 * sitemap'te görünmez. Yazılar ve yönetim paneli silinmeden durur; true yapınca blog yeniden açılır.
 */
export const features = { blog: false } as const;

export type NavItem = { href: string; label: string; description?: string };

/** Ana menü. "Hizmetler" açılır menüyle gösterilir. */
export const services: NavItem[] = [
  { href: "/hizmetler/kurumsal-web-sitesi", label: "Kurumsal web sitesi", description: "Firmanıza özel tasarım, yayın ve bakım" },
  { href: "/hizmetler/google-ads-yonetimi", label: "Google Ads yönetimi", description: "Kurulum, optimizasyon ve aylık raporlama" },
  { href: "/hizmetler/bakim-ve-destek", label: "Bakım ve destek", description: "Güncelleme, yedekleme ve panelden destek" },
  { href: "/hizmetler/arama-motoru-uyumu", label: "Arama motoru uyumu", description: "Google'da bulunabilir teknik altyapı" },
];

export const nav: NavItem[] = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/nasil-calisir", label: "Nasıl çalışır" },
  { href: "/paketler", label: "Paketler" },
  { href: "/referanslar", label: "Referanslar" },
  ...(features.blog ? [{ href: "/blog", label: "Blog" }] : []),
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

/** Alt bilgide ana menüye ek olarak gösterilen sayfalar. */
export const footerPages: NavItem[] = [
  ...nav.filter((n) => n.href !== "/hizmetler"),
  { href: "/sss", label: "Sık sorulan sorular" },
];

export const legalPages: NavItem[] = [
  { href: "/yasal/mesafeli-satis", label: "Mesafeli satış sözleşmesi" },
  { href: "/yasal/on-bilgilendirme", label: "Ön bilgilendirme formu" },
  { href: "/yasal/iptal-iade", label: "İptal, cayma ve iade koşulları" },
  { href: "/yasal/kvkk", label: "KVKK aydınlatma metni" },
  { href: "/yasal/gizlilik-ve-cerez", label: "Gizlilik ve çerez politikası" },
  { href: "/yasal/kullanim-kosullari", label: "Site kullanım koşulları" },
];
