# Güvenlik analizi (23 Ekim 2026)

Kapsam: kod incelemesi + canlı yoklamalar (geliştirme sunucusu). Gerçek iyzico, Resend ve Vercel Blob ile denenmedi; bir sızma testi değildir.

## Düzeltilenler
| Önem | Bulgu | Düzeltme |
|---|---|---|
| Orta | Şifre sıfırlanınca açık oturumlar kapanmıyordu. Bir e-postayı önceden kaydedip oturumunu açık tutan saldırgan, gerçek sahibi şifreyi yenilese bile erişimini koruyordu | `revokeSessionsOnPasswordReset: true` (`lib/auth.ts`) |
| Düşük | JSON-LD, script içine `JSON.stringify` ile basılıyordu; yönetimden girilen bir blog başlığında kapanış etiketi olursa betikten çıkılıp HTML enjekte edilebilirdi (yalnızca yönetici girdisi) | `lib/jsonld.ts` (`<`, `>`, `&` kaçışlanır), `tests/security.test.ts` |
| Düşük | Canlı aboneliği olan müşteri, abonelik başlatma action'ını tekrar göndererek imzalanmış firma kimliğini (unvan, vergi no, adres) değiştirebiliyordu: firma kaydı "zaten aboneliğiniz var" kontrolünden önce güncelleniyordu | Kontrol güncellemeden önceye alındı (`app/(site)/abonelik/[slug]/actions.ts`). Not: iyzico anahtarı yokken bu yola ulaşılmadığı için canlı akışta değil, kodla doğrulandı |
| Düşük | `GET /api/taahhutname` hız sınırsızdı ve durum değiştiriyordu (PDF üretir, depoya yazar) | POST'a çevrildi, kullanıcı başına saatte 30 sınırı, sayfadaki bağlantı form oldu |
| Düşük | Blogda bilinmeyen adresler her istekte veritabanına gidip adres başına önbellek kaydı oluşturuyordu | Yazılar tek önbellek kaydından okunuyor; bilinmeyen adres 404, sorgu yok |
| Düşük | `rate_limit` tablosu hiç temizlenmiyordu | Günlük cron 2 günden eski satırları siler (`purgeExpiredRateLimits`, testli) |

## Açık riskler (yapılması önerilenler)
| Önem | Bulgu | Öneri |
|---|---|---|
| Orta | E-posta doğrulaması yok. Herkes başkasının e-postasıyla hesap açabilir (ön-kayıt); kayıt ekranı "User already exists" diyerek hesabın varlığını gösterir (kullanıcı numaralandırma, saatte 10 deneme sınırlı) | Resend bağlanınca `requireEmailVerification` aç, abonelik başlatmadan önce doğrulama iste |
| Orta | Yönetim paneli sitenin aynı kökeninde (`/yonetim`). Sitede bir XSS bulunursa yönetici oturumu ele geçirilebilir | Paneli alt alan adına (admin.kasifyazilim.com.tr) taşı, yönetici için 2 adımlı doğrulama (Better Auth 2FA) ve kısa oturum süresi |
| Orta | İçerik güvenlik politikası (CSP) yok. iyzico ödeme formu kendi betiklerini yüklediği için sandbox'ta denenmeden eklenemedi | Sandbox çalışınca `Content-Security-Policy-Report-Only` ile başla, sonra sıkılaştır |
| Düşük | Yönetici oturumu varsayılan 7 gün | Yönetici için 8 saat gibi kısa süre |
| Düşük | Hız sınırı IP'yi `x-forwarded-for`'dan alır. Vercel'de platform doldurur, kendi sunucuda sahte gönderilebilir. Hız sınırı veritabanı hatasında isteği geçirir (kilitlenmesin diye bilinçli) | Yalnızca Vercel'de yayınla; kendi sunucuda ters proxy ayarı yap |
| Düşük | Yüklenen PDF/görseller için zararlı içerik taraması yok. Dosyalar yalnızca indirilir (`attachment`, `nosniff`), ama yönetici indirdiği PDF'i açar | Dosya taraması (ör. ClamAV) veya yalnızca görüntüleyicide açma |
| Bilgi | `npm audit`: 4 orta uyarı, hepsi geliştirme aracı (drizzle-kit → esbuild geliştirme sunucusu). Üretim paketine girmez | drizzle-kit sürümünü güncelle |
| Bilgi | Neon veritabanı şifresi sohbette paylaşıldı | Şifreyi değiştir, `.env.local` ve Vercel'i güncelle |

## Doğrulanan güçlü yanlar
- 14 server action dosyasının hepsi yetki çağırıyor (müşteri: `requireUser`, yönetici: `requireAdmin`); iletişim formu bilinçli olarak herkese açık ve hız sınırlı.
- Veri sahipliği: müşteri işlemleri firma kimliğine bağlı (başkasının talebi, dosyası, faturası 404). Daha önce tarayıcıda denendi.
- `/api/dosya`: oturum şart, yol doğrulaması (`..` yok), yalnızca kendi firma klasörü; `attachment` + `nosniff`; dosya türü içerikten (magic bytes), SVG/HTML kabul edilmez.
- Yabancı kökenli giriş isteği 403; anonim `/yonetim`, `/panel`, `/api/dosya`, `/api/taahhutname`, `/api/cron` reddediliyor.
- Webhook: imza zorunlu ve `timingSafeEqual`; yapılandırma yoksa 503; idempotent.
- Cron: gizli anahtar zaman-sabit karşılaştırılıyor; anahtar tanımsızsa her istek reddedilir.
- SQL: Drizzle parametreli; tek ham SQL (hız sınırı) parametre bağlıyor; arama joker karakterleri kaçışlanıyor.
- Açık yönlendirme: `safeNext` yalnızca site içi yol.
- Blog: Markdown ham HTML'e izin vermiyor; önizleme adresi yalnızca http(s) ve `noopener`.
- Hesap: rol istemciden alınmıyor (`input: false`); admin yetkisi yalnızca veritabanı betiğiyle; şifre sıfırlama "var mı yok mu" söylemiyor.
- Hız sınırı: giriş 5/dk, kayıt 10/saat, şifre sıfırlama 5/saat, iletişim, talep, yükleme, abonelik ve iptal sınırlı.
- Sırlar: `.env*` git dışında; depoda sızmış anahtar yok; kart verisi hiç saklanmıyor; `identityNumber` saklanmıyor.
- Başlıklar: HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer ve izin politikası.

## Denenmeyenler
iyzico webhook imzası (gerçek iyzico ile), Vercel Blob'un özel erişimi, üretimdeki çerez bayrakları, yük ve hizmet reddi, bağımlılıkların tedarik zinciri incelemesi.

## İkinci tur (Cloudflare security-audit skill'i, rehber modu, tek ajan)
Düzeltmelerden sonra yeniden tarandı; yeni alanlar da eklendi. Yerel sunucuda sahte hesapla canlı denendi (hesap silindi):
- **Rol yükseltme:** kayıt gövdesine `role: "admin"` ve `emailVerified: true` eklemek etkisiz (veritabanında rol "customer", doğrulama false). `update-user` ile rol değişimi 400 `FIELD_NOT_ALLOWED`, e-posta değişimi 400, `change-email` kapalı.
- **Yönetim sayfaları müşteri oturumuyla:** 8 yönetim yolu da yönlendirme verisi döndürüyor, yönetim içeriği sızmıyor. Gövdede yalnızca sayfa başlığı (`<title>`, paylaşım etiketleri) geçiyor: yönetim sayfalarının adları görünür (bilgilendirme düzeyi, veri değil).
- **Sayfa geçişi kepenği ve açılış kepenği:** yalnızca istemci tarafı, kullanıcı girdisi işlemiyor.
- **Önbellek:** `"use cache"` fonksiyonları kullanıcıya özel veri taşımıyor (paketlerde iyzico referansları dışarı verilmiyor, yalnızca yayındaki yazılar).

Kalan kabul edilmiş risk: iyzico ödeme formu sunucudan gelen HTML'i `innerHTML` ile ekliyor ve betiklerini yeniden oluşturuyor. İçerik yalnızca iyzico API'sinden (TLS) geliyor; iyzico hesabı ya da TLS ele geçirilirse sitede betik çalışır. CSP (yukarıda) ve ayrı alan adındaki yönetim paneli bunun etkisini azaltır.
