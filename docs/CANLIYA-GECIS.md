# Canlıya geçiş kontrol listesi

Her madde bitmeden gerçek müşteri alınmaz. `[ ]` yapılmadı, `[x]` yapıldı.

## 1. İçerik ve hukuk
Sözleşmeler ve yasal metinler yazıldı (`lib/legal-docs.ts`, `docs/taahhutname.md`). Yayından önce bir avukat okumalı; metinler genel bir taslak değildir ama senin işine özel kararlar içerir.
- [ ] Firma kimliği `lib/site.ts` içindeki `company` nesnesine girildi (unvan, MERSİS, vergi dairesi/no, adres, KEP, telefon, e-posta). Tüm sözleşmelerde otomatik kullanılır
- [ ] Avukat şu metinleri inceledi: mesafeli satış sözleşmesi, ön bilgilendirme formu, iptal/cayma/iade, KVKK aydınlatma, gizlilik ve çerez, kullanım koşulları, taahhütname
- [ ] Metinlerdeki `[İÇERİK: ...]` kararları verildi: teslim süresi, KDV dahil/hariç, taahhüt sonrası yenileme, abonelik sonrası site dosyalarının devri veya lisansı, memnuniyet iptalinde iade politikası, alan adı ücreti, destek yanıt süresi, yurt dışı aktarım rızası
- [ ] Metin değişince `lib/legal.ts` içindeki sürüm ve `LEGAL_UPDATED` tarihi güncellendi
- [ ] `web` paketinin fiyatı, paketlerin madde listeleri yönetim panelinden dolduruldu
- [ ] Referanslar sayfası gerçek müşteri çalışmalarıyla dolduruldu (şu an yalnızca örnek tasarımlar var ve öyle etiketli)
- [ ] `grep -rn "İÇERİK" app components lib emails docs` ile kalan yer tutucular tarandı

## 2. iyzico
- [ ] Canlı hesap ve Abonelik ürünü açık; canlı `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_MERCHANT_ID` Vercel'de, `IYZICO_BASE_URL=https://api.iyzipay.com`
- [ ] Önce sandbox anahtarlarıyla uçtan uca deneme: abonelik başlat, callback, webhook, kart güncelleme, iptal (bu akışlar şu ana kadar yalnızca sahte iyzico sunucusuyla denendi)
- [ ] `npm run iyzico:sync` (kuru çalışma), sonra `npm run iyzico:sync -- --apply` ile canlı ürün ve plan oluşturuldu
- [ ] iyzico panelinde webhook URL'si `https://<alan adı>/api/webhooks/iyzico` tanımlı ve **webhook imzası (X-IYZ-SIGNATURE-V3) özelliği açık**
- [ ] Callback adresi HTTPS (`BETTER_AUTH_URL` canlı alan adı)
- [ ] Şirket müşteriler için iyzico'nun vergi no kabul edip etmediği netleşti (şu an T.C. kimlik no isteniyor ve saklanmıyor)

## 3. Ortam değişkenleri (Vercel > Settings > Environment Variables, Production)
- [ ] `DATABASE_URL` (üretim Neon dalı), `BETTER_AUTH_SECRET` (yeni, 32+ karakter), `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`
- [ ] `BLOB_READ_WRITE_TOKEN` (Vercel Blob mağazası **private**). Yoksa yükleme canlıda bilerek hata verir
- [ ] `RESEND_API_KEY`, `EMAIL_FROM` (Resend'de doğrulanmış alan adı: SPF ve DKIM kayıtları), `ADMIN_EMAIL`
- [ ] `CRON_SECRET`
- [ ] Geliştirmede kullanılan Neon şifresi döndürüldü (sohbette paylaşılmıştı)

## 4. Veritabanı ve yönetici
- [ ] `npm run db:migrate` üretim veritabanında çalıştı
- [ ] `npm run db:seed` ile paketler oluştu
- [ ] Yönetici hesabı `/kayit` ile açıldı, `npm run db:make-admin -- <e-posta>` ile yetki verildi
- [ ] Test kullanıcıları ve test kayıtları üretimde yok

## 5. Doğrulama
- [ ] `npm run lint`, `npm test`, `npm run build` temiz
- [ ] Üretim derlemesinde (`npm start`) yönetim panelindeki **fiyat kaydetme** denendi (geliştirme modunda ikinci kayıt 30 ile 90 saniye sürdü, nedeni bulunamadı)
- [ ] Gerçek e-posta gönderimi denendi: hoş geldin, ödeme alındı/başarısız, taahhütname onay/red, aşama değişimi, destek yanıtı, iptal sonucu, şifre sıfırlama, iletişim formu
- [ ] Cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://<alan adı>/api/cron/sync` 200 döndürüyor
- [ ] Lighthouse (mobil ve masaüstü) ve erişilebilirlik taraması yapıldı; bu çalışmada **çalıştırılmadı**
- [ ] Mobil cihazda panel ve ödeme formu elle denendi
- [ ] Hız sınırı: art arda yanlış giriş 5. denemeden sonra engelleniyor

## 6. Bilinen eksikler ve kararlar
- Content-Security-Policy yok: iyzico ödeme formu kendi betik ve çerçevelerini yükler. Sandbox'ta form çalışır hale getirildikten sonra `Content-Security-Policy-Report-Only` ile başlayıp sıkılaştırılmalı.
- Hız sınırı veritabanına yazılır (ek bir hizmet gerektirmez). Trafik büyürse Upstash Redis gibi bir depoya taşınabilir.
- Hizmeti iptal edilen müşteri panelde "Henüz aboneliğiniz yok" görür; eski mesajları ve geçmişi görmez.
- İptal talebini müşteri geri çekemez, destek talebiyle yapılır.
- Müşteri siteleri, aylık Google Ads raporu ve e-fatura ayrı projelerdir (`docs/PLAN.md`).
