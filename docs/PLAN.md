# kasifyazilim.com.tr — Aşama Planı

Kullanım: Her aşamada Claude Code'a "docs/PLAN.md içindeki Aşama X'i uygula" de.
Bir aşama bitip sen kontrol etmeden diğerine geçme. Her aşama sonunda commit at.

---

## Aşama 0 — Kurulum (elle, sen yaparsın)

1. `npx create-next-app@latest kasifyazilim --typescript --tailwind --app --eslint`
2. `CLAUDE.md` → proje köküne, `PLAN.md` → `docs/` klasörüne
3. Claude Code içinde:
   - `/plugin marketplace add anthropics/claude-code`
   - `/plugin install frontend-design` (menüden seçerek kontrol et)
   - Playwright MCP (Claude'un sayfaları görüp eleştirmesi için):
     `claude mcp add playwright -- npx @playwright/mcp@latest`
4. GitHub repo → Vercel'e bağla, Neon veritabanını Vercel Marketplace'ten ekle
5. iyzico **sandbox** hesabı aç, Abonelik özelliğinin hesabında açık olduğunu temsilcine teyit ettir
6. `docs/referans/` klasörüne beğendiğin 2-3 sitenin ekran görüntüsünü koy, logonu `public/` altına koy

---

## Aşama 1 — Tasarım yönü (kod yok)

```
CLAUDE.md'yi ve docs/referans/ altındaki görselleri incele. frontend-design skill'ini kullan.
kasifyazilim.com.tr için 3 farklı tasarım yönü öner. Her biri için:
font çifti, renk paleti (hex), düzen yaklaşımı, ana sayfanın ilk ekranının kaba tarifi,
ve bu yönün neden "şablon/AI" gibi görünmeyeceği.
Hedef kitle: Türkiye'de web sitesi ve Google reklamı ihtiyacı olan KOBİ'ler, esnaf, firmalar.
Kod yazma. Ben birini seçince Aşama 2'ye geçeceğiz.
```

## Aşama 2 — Tanıtım sitesi

```
Seçtiğim tasarım yönü: [BURAYA YAZ]. Bunu docs/TASARIM.md olarak kaydet ve token'ları
globals.css'e işle. Ardından şu sayfaları yap:
- Ana sayfa: ne sattığımız, nasıl çalıştığı (paket seç → öde → bilgileri gönder → siteniz yayında),
  iki paket, 12 ay taahhüt + memnuniyet iptali, reklam bütçesinin müşteriye ait olduğu, SSS
- /paketler: iki paketin karşılaştırması, fiyatlar veritabanından gelecek (şimdilik sabit veri + TODO)
- /referanslar: [İÇERİK] yer tutucularıyla
- /hakkimizda, /iletisim (form → şimdilik console, Aşama 7'de e-posta)
- /yasal/mesafeli-satis, /yasal/on-bilgilendirme, /yasal/kvkk, /yasal/iptal-iade — iskelet + [İÇERİK]
SEO temeli: her sayfaya metadata, sitemap.ts, robots.ts, Organization JSON-LD.
Bitince her sayfanın masaüstü ve mobil ekran görüntüsünü al, CLAUDE.md yasak listesine göre
eleştir ve düzelt. Sonra bana özet ver.
```

## Aşama 3 — Veritabanı ve kimlik doğrulama

```
Drizzle + Neon ve Better Auth kur. Roller: customer, admin. Şema:
- users, sessions (Better Auth)
- companies: unvan, vergi_dairesi, vergi_no, adres, il, yetkili_ad, yetkili_telefon, user_id
- packages: slug, ad, aciklama, aylik_fiyat_kurus, aktif, iyzico_product_ref, iyzico_plan_ref
- subscriptions: company_id, package_id, iyzico_subscription_ref, iyzico_customer_ref,
  status (pending|active|payment_failed|cancel_requested|cancelled|expired),
  baslangic, taahhut_bitis, iptal_tarihi
- payments: subscription_id, iyzico_order_ref, tutar_kurus, status, odeme_tarihi, ham_veri (jsonb)
- agreement_acceptances: user_id, belge_turu, belge_versiyonu, ip, user_agent, created_at
- commitment_documents: company_id, uretilen_pdf_url, imzali_yukleme_url,
  status (bekliyor|yuklendi|onaylandi|reddedildi), red_nedeni, onaylayan_admin_id
- onboarding_forms: company_id, veri (jsonb), status (taslak|gonderildi)
- projects: company_id, asama (bilgi_bekleniyor|taahhutname_bekleniyor|tasarim|musteri_onayi|
  gelistirme|yayinda|sonlandirildi), notlar
- project_events: project_id, asama, aciklama, created_at (müşteriye zaman çizelgesi)
- tickets: company_id, kategori (teknik|icerik|fatura|reklam|iptal|diger), oncelik, konu,
  status (acik|yanit_bekliyor|cevaplandi|kapandi)
- ticket_messages: ticket_id, yazan_user_id, mesaj, ekler (jsonb), created_at
- audit_log: actor_user_id, islem, hedef_tablo, hedef_id, detay (jsonb), created_at
Kayıt, giriş, şifre sıfırlama sayfalarını tasarım diline uygun yap. /panel (müşteri) ve
/yonetim (admin) için rol korumalı layout'lar oluştur. İki paketi seed et.
```

## Aşama 4 — Satın alma ve iyzico abonelik (sandbox)

```
iyzico Abonelik API v2'yi resmi dokümana göre entegre et (CLAUDE.md'deki linke bak,
endpoint ve alanları dokümandan doğrula). Akış:
1. /paketler'den paket seç → giriş/kayıt yoksa önce o
2. Firma bilgileri formu (companies)
3. Mesafeli satış, ön bilgilendirme, KVKK onay kutuları → agreement_acceptances'a kaydet
4. iyzico Checkout Form ile abonelik başlat (12 aylık plan)
5. Callback'te sonucu iyzico'dan sorgula (sadece callback parametresine güvenme),
   subscription ve ilk payment kaydını oluştur, project'i "taahhutname_bekleniyor" başlat
6. /api/webhooks/iyzico: imzayı doğrula, idempotent işle; başarılı ödeme → payments,
   başarısız ödeme → status payment_failed + müşteriye ve admine e-posta (şimdilik log)
7. Paket ↔ iyzico ürün/plan eşlemesi için bir script yaz (scripts/iyzico-sync.ts)
Tüm akışı sandbox test kartlarıyla uçtan uca dene ve sonucu raporla.
```

## Aşama 5 — Taahhütname ve başlangıç formu

```
1. Ödeme sonrası müşterinin firma bilgileriyle doldurulmuş taahhütname PDF'i üret
   (metin: docs/taahhutname.md — yoksa [İÇERİK] yer tutuculu bir iskelet oluştur).
   Müşteri indirir, kaşeli/imzalı halini PDF veya fotoğraf olarak yükler (Vercel Blob).
2. Başlangıç formu (çok adımlı, taslak kaydedilebilir):
   - Firma: sektör, hizmetler/ürünler, hedef bölge, rakipler, kısa tanıtım metni
   - Marka: logo yükleme, renkler, beğendiği siteler
   - İçerik: sayfa listesi, metinler (yoksa "siz yazın" seçeneği), fotoğraflar
   - Alan adı: mevcut alan adı var mı, kimin adına kayıtlı, DNS erişimi
     (Not: alan adı müşteri adına kayıtlı olmalı — iptalde müşteride kalıyor)
   - Google Ads (sadece web-ads paketinde): Ads hesabı var mı, hedef aylık bütçe,
     hedeflenen işlem (arama, form, WhatsApp), bölge
3. Taahhütname onaylanıp form gönderilince project otomatik "tasarim" aşamasına geçer.
```

## Aşama 6 — Müşteri paneli (/panel)

```
- Özet: abonelik durumu, sonraki ödeme tarihi, taahhüt bitiş tarihi, proje aşaması
- Proje takibi: aşamalar zaman çizelgesi (project_events), "Onayınızda" aşamasında
  önizleme linki + Onayla / Revizyon iste butonları
- Destek: talep aç (kategori, konu, mesaj, dosya ekleme), talep listesi, mesajlaşma ekranı
- Ödemeler: geçmiş ödemeler, fatura PDF'i (admin yüklediyse) indirme,
  kart güncelleme (iyzico kart güncelleme checkout formu)
- Aboneliği iptal et: iptal nedeni zorunlu → "iptal" kategorisinde ticket açar,
  subscription status cancel_requested olur. Hiçbir şey anında iptal olmaz.
  Ekranda açıkça yaz: talebiniz ekibimize iletildi, alan adınız sizde kalır.
- Firma bilgileri ve belgeler (taahhütname, onaylanan sözleşmeler)
```

## Aşama 7 — Yönetim paneli (/yonetim)

```
- Gösterge: aktif abone sayısı, aylık tekrarlayan gelir (MRR), başarısız ödemeler,
  açık destek talepleri, bekleyen taahhütnameler, iptal talepleri
- Müşteriler: liste + detay (firma, abonelik, ödemeler, proje, talepler, belgeler, audit log)
- Taahhütname onay/red (red nedeni müşteriye e-postayla gider)
- Proje aşaması değiştirme + müşteriye görünen not ekleme
- Destek: talepleri filtreleme (kategori/durum/öncelik), yanıtlama, kapatma
- İptal talebi: değerlendir → "İptali onayla" iyzico aboneliğini iptal eder,
  subscription cancelled, project sonlandirildi, müşteriye e-posta. Onay ekranında
  geri alınamaz uyarısı ve iki adımlı onay.
- Paketler: fiyat ve açıklama düzenleme (iyzico plan fiyatı değişirse uyar —
  mevcut aboneleri etkilememesi için yeni plan gerekir, dokümana bak)
- Faturalar: ödeme kaydına fatura PDF'i yükleme
- Tüm admin işlemleri audit_log'a
```

## Aşama 8 — E-postalar, zamanlanmış işler, yayın öncesi

```
- Resend + React Email şablonları (tasarım diline uygun, sade): hoş geldin, ödeme alındı,
  ödeme başarısız, taahhütname onay/red, proje aşaması değişti, destek yanıtı,
  yeni destek talebi (admine), iptal talebi (admine), iptal onaylandı, iletişim formu
- Vercel Cron (günlük): webhook kaçırılmış olabilecek abonelikleri iyzico'dan sorgula ve
  senkronize et; 3 gündür yanıtsız talepleri admine hatırlat
- Güvenlik: rate limit (giriş, iletişim, destek), dosya türü/boyut kontrolü,
  güvenlik başlıkları
- Lighthouse ve erişilebilirlik kontrolü, 404/500 sayfaları
- Canlıya geçiş kontrol listesi: iyzico canlı anahtarları, canlı ürün/plan senkronu,
  webhook URL'sinin iyzico panelinde tanımlı olması, yasal metinlerin dolu olması
```

---

## Sonraki projeler (bu repoda değil)

- Müşteri siteleri için ortak çekirdek: içerik yönetim paneli + "Destek / Aboneliğim"
  linki (kasifyazilim.com.tr/panel'e yönlendirir)
- Müşteri panelinde aylık Google Ads raporu (Google Ads API onayı gerekir)
- Sektörel demo siteler, otomatik e-fatura (Paraşüt vb.), referans programı
