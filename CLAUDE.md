# Kaşif Yazılım — kasifyazilim.com.tr

Kurumsal web sitesi + Google Ads hizmetini **aylık abonelikle** satan firmanın sitesi.
Müşteri paket seçer, iyzico ile abone olur, ardından ekibimiz sitesini yapar.

Bu dosya her oturumda geçerlidir. Aşama planı: `docs/PLAN.md`.

## Ürün kuralları (değiştirme, sorarak ilerle)

- **Paketler (fiyatlar veritabanında, yönetim panelinden değiştirilebilir — koda gömme):**
  1. `web` — Kurumsal Web Sitesi (fiyat: TBD)
  2. `web-ads` — Kurumsal Web Sitesi + Google Ads Yönetimi — 3.000 TL/ay
- **Taahhüt:** 12 ay, ödeme her ay kartdan otomatik çekilir (iyzico Abonelik API).
- **Memnuniyet iptali:** Müşteri 12 ay içinde memnun kalmazsa iptal edebilir. İptal **anında olmaz**: talep olarak bize düşer, yönetici onaylarsa iyzico aboneliği iptal edilir ve hizmetler sonlanır. Alan adı müşteride kalır.
- **Reklam bütçesi müşteriye aittir.** Google Ads harcaması müşterinin kartından doğrudan Google'a ödenir; bizim aboneliğimiz yalnızca hizmet bedelidir. Bu ayrım sitede, sözleşmede ve fiyat sayfasında açıkça yazmalı.
- **Taahhütname:** Müşterinin firma bilgileriyle otomatik doldurulmuş PDF üretilir; müşteri indirir, kaşe + imza ile yükler, yönetici onaylar. Onaylanmadan proje "Tasarım" aşamasına geçmez.
- **Sözleşme onayları kayıt altına alınır:** hangi belge, hangi versiyon, tarih, IP, kullanıcı.

## Teknik yığın

- Next.js (App Router, TypeScript strict, Server Components öncelikli, Server Actions)
- Tailwind CSS — tasarım token'ları `app/globals.css` içinde CSS değişkeni olarak
- Neon Postgres + Drizzle ORM (migration'lar `drizzle/` altında, elle SQL yazma)
- Better Auth — e-posta/şifre, roller: `customer`, `admin`
- Resend — işlem e-postaları (React Email şablonları)
- Vercel — hosting, Vercel Blob (dosya yükleme), Vercel Cron
- iyzico Abonelik API (v2). Resmi dokümana göre uygula: https://docs.iyzico.com/urunler/abonelik — tahmin etme, endpoint ve alanları dokümandan doğrula. İmza (IYZWSv2) ve webhook doğrulaması zorunlu.
- Zod ile tüm form ve webhook girdisi doğrulanır.

## Kod kuralları

- Para tutarları kuruş cinsinden `integer` tutulur, float kullanılmaz.
- Tarihler UTC saklanır, Europe/Istanbul gösterilir.
- Gizli anahtarlar yalnızca `.env` / Vercel env. `.env.example` güncel tutulur.
- Her yönetici işlemi ve abonelik durum değişikliği `audit_log` tablosuna yazılır.
- Webhook işleyicileri idempotent olmalı (aynı bildirim iki kez gelirse sorun çıkmamalı).
- Türkçe içerik, İngilizce kod (değişken, tablo, fonksiyon adları).
- Bir aşama bitince: `npm run build` ve `npm run lint` hatasız geçmeli.

## TASARIM — "AI ile yapılmış" görünmemeli

Bu sitenin işi web sitesi satmak. Ziyaretçi "bu şablon" veya "bunu AI yaptı" derse satış biter.
`frontend-design` skill'ini kullan. Kod yazmadan önce tasarım yönünü öner ve onay al.

**Yasak:**
- Mor/mavi gradyanlar, bulanık renkli "blob" arka planlar, glassmorphism kartlar
- Inter, Geist, Roboto, Poppins gibi varsayılan fontlar
- Emoji veya rastgele Lucide ikonlarıyla süslenmiş üçlü özellik kartları
- Her bölümün "ortada başlık + alt başlık + 3 kart" kalıbında olması
- "Dijital dönüşüm yolculuğunuz", "işinizi bir üst seviyeye taşıyın", "sorunsuz", "yenilikçi çözümler" gibi boş pazarlama dili
- Uydurma istatistik ("%300 büyüme"), uydurma müşteri yorumu, stok fotoğraf hissi veren görseller
- Gereksiz animasyon; her şeyin fade-in ile girmesi

**Olmalı:**
- Karakterli bir font çifti (başlık + metin), net bir tipografik hiyerarşi
- Sınırlı, bilinçli bir renk paleti; bir vurgu rengi
- Asimetrik, editoryal düzenler; bölümler birbirinden farklı ritimde
- Somut, kısa, Türkçe metinler: ne yapıyoruz, ne kadar, ne kadar sürede, ne teslim ediyoruz
- Fiyat ve taahhüt koşulları saklanmadan, açıkça
- İçerik eksikse `[İÇERİK: ...]` yer tutucusu bırak, uydurma
- Mobilde de aynı özen; erişilebilirlik (kontrast, odak durumları, alt metinler)

Sayfa bittiğinde ekran görüntüsünü al (Playwright MCP), yukarıdaki yasak listesine göre kendi işini eleştir, düzelt.


## Güncelleme (tasarım ve yapı)

- Site, yönetim panelinden **bağımsızdır**: `app/(site)` üst menü/alt bilgiyle, `app/(admin)` kendi yan menülü kabuğuyla gelir (`app/app-shell.css`; müşteri paneli `/panel` de aynı şekilde `app/(panel)` grubunda kendi kabuğuyla gelir).
- Site ilk sürümde fazla sade bulundu: akinsoft.com gibi tam bir kurumsal yazılım firması görünümü hedeflenir. Yukarıdaki "yasak" listesi (gradyan, blob, glass, uydurma rakam/yorum, stok fotoğraf) geçerli kalır; zenginlik ürün çizimleriyle (`components/visuals.tsx`), bölüm ritmiyle ve içerikle sağlanır.
- Paketlerin tamamı (ad, özet, madde listesi, fiyat, sıra, reklam içerir mi) veritabanında ve yönetimden düzenlenir; yeni paket eklenebilir. Hiçbir paket slug'ı kodda sabit değildir.
- Blog yazıları veritabanında (Markdown), yönetimden yazılır. Hukuki metinler `lib/legal-docs.ts` içindedir.
- Logo: markanın kendi tasarımı (`public/logo/*`, K işareti + KAŞİF YAZILIM yazısı; koyu, beyaz ve sarı varyantlar). Bileşen: `components/logo.tsx`. Favicon `app/icon.png`. Logoyu yeniden çizme, orijinali kullan.

- Sitenin tek amacı: **telefon araması ya da WhatsApp yönlendirmesi**. Bütün çağrı düğmeleri `components/contact-buttons.tsx`, numara `lib/site.ts` (`site.phone`, `site.whatsapp`); iletişim formu kaldırıldı. Yeni sayfa/bölüm eklerken CTA olarak `ContactPair` kullan, `/abonelik` ya da form bağlantısı koyma.
