// Başlangıç blog yazıları (scripts/seed-blog.ts). Sonradan yönetim panelinden düzenlenir.
// Rakam ve istatistik uydurulmadı; yalnızca genel doğrular ve uygulanabilir öneriler var.
export type SeedPost = { slug: string; title: string; excerpt: string; category: string; daysAgo: number; body: string };

export const seedPosts: SeedPost[] = [
  {
    slug: "web-sitesi-yaptirirken-sorulmasi-gereken-10-soru",
    title: "Web sitesi yaptırırken ajansa sorulması gereken 10 soru",
    excerpt: "Fiyatın ötesinde: alan adı, bakım, kaynak dosyalar ve iptal koşulları. Teklif almadan önce yanıtını bilmeniz gerekenler.",
    category: "Web sitesi",
    daysAgo: 2,
    body: `Web sitesi yaptırmak çoğu firma için bir kerelik bir karar gibi görünür ama asıl maliyet çoğu zaman sonrasında ortaya çıkar. Teklifleri karşılaştırırken yalnızca fiyata değil, aşağıdaki sorulara verilen yanıtlara bakın.

## 1. Alan adı kimin adına kaydedilecek?

Alan adı sizin adınıza kayıtlı olmalı. Ajans adına kayıtlı bir alan adı, ayrılmak istediğinizde size rehin olabilir. Kayıt belgelerinde sahip olarak firmanızın adını görün.

## 2. Siteyi sonradan kim güncelleyecek?

"Siteyi teslim ettik" cümlesi, sonraki değişikliklerin ücretli olduğu anlamına gelebilir. Metin, görsel ve telefon numarası gibi küçük değişikliklerin nasıl ve ne kadara yapıldığını sorun.

## 3. Bakım ve güvenlik dahil mi?

Yazılım güncellemeleri, yedekleme ve güvenlik önlemleri kimin sorumluluğunda? Dahilse hangi sıklıkla yapılıyor?

## 4. Tasarım size özel mi, şablon mu?

Şablon kötü değildir ama bunu bilerek karar vermelisiniz. Farkı fiyata yansıtıp yansıtmadıklarına bakın.

## 5. Mobilde nasıl görünüyor?

Ziyaretçilerin büyük kısmı telefondan gelir. Önizlemeyi kendi telefonunuzda açıp deneyin; menü, butonlar ve yazılar rahat kullanılıyor mu?

## 6. Revizyon hakkınız nasıl işliyor?

Tasarımı beğenmezseniz kaç kez değişiklik isteyebilirsiniz? Önizleme ve onay süreci yazılı mı?

## 7. İçerikleri kim hazırlayacak?

Metinleri siz mi göndereceksiniz, ajans mı yazacak? Yazılacaksa ücrete dahil mi? Sitenin ne zaman yayına gireceği genelde içerik hazır olduğunda belli olur.

## 8. Sözleşmeden nasıl çıkarsınız?

Taahhüt süresi var mı? Memnun kalmazsanız ne olur? Bu sorunun yanıtı yazılı olmalı. İptal koşulu belirsiz bir sözleşme imzalamayın.

## 9. Site dosyaları ve içerikleriniz size mi ait?

Siteyi bırakırsanız içeriklerinizi (metin, görsel, logo) alabiliyor musunuz? Tasarım ve yazılım için lisans koşulu nedir? Bunu baştan netleştirin.

## 10. Siteyi Google bulabilecek mi?

"SEO yapıyoruz" ifadesi geniş bir şemsiyedir. Somut sorun: sayfa başlıkları, site haritası, hız ve mobil uyum gibi teknik işler yapılıyor mu? Hiç kimse ilk sırada çıkacağınızı garanti edemez; böyle bir söz veren ajansa dikkat edin.

## Kısaca

İyi bir teklif, bu soruların hepsine yazılı ve açık yanıt verir. Yanıtlar belirsizse sorun fiyatta değil, kapsamdadır.`,
  },
  {
    slug: "google-ads-e-baslamadan-once-bilmeniz-gerekenler",
    title: "Google Ads'e başlamadan önce bilmeniz gereken 7 şey",
    excerpt: "Bütçe kimin, hesap kimin, sonuç nasıl ölçülür? Reklam vermeden önce netleştirmeniz gereken temel noktalar.",
    category: "Google Ads",
    daysAgo: 5,
    body: `Google Ads, doğru kurulduğunda hızlı sonuç verebilen bir kanal. Yanlış kurulduğunda ise bütçe sessizce erir. Başlamadan önce şu yedi noktayı netleştirin.

## 1. Hesap sizin olmalı

Google Ads hesabı sizin adınıza açılmalı ve sahibi siz olmalısınız. Bir yönetici veya ajans, hesaba yönetim erişimiyle çalışabilir. Böylece ayrılırsanız hesabınız, geçmiş verileriniz ve kampanyalarınız sizde kalır.

## 2. Reklam bütçesi ile hizmet bedeli farklı şeylerdir

Reklam bütçesi, Google'a ödediğiniz tutardır. Hizmet bedeli ise reklamları yöneten kişi ya da firmaya ödediğinizdir. İkisini karıştırmayın; bütçenin nereye gittiğini her zaman Google hesabınızdan görebilirsiniz.

## 3. Ne istediğinizi bilin

Telefon araması mı, form doldurma mı, WhatsApp mesajı mı, mağazaya yönlendirme mi? Hedef net değilse kampanya da net olamaz. Reklam hedefi, hangi sayfaya yönlendireceğinizi de belirler.

## 4. Bölgeyi daraltın

Yalnızca hizmet verdiğiniz il ve ilçelerde reklam gösterin. Tüm Türkiye'ye açık bir kampanya, hizmet vermediğiniz yerlerden gelen tıklamalara bütçe harcar.

## 5. Dönüşümleri ölçün

Telefon, form ve WhatsApp yönlendirmelerinin hangi reklamdan geldiğini ölçmeden optimizasyon yapılamaz. Dönüşüm takibi kurulumunun ilk günden yapıldığından emin olun.

## 6. Siteniz hazır olmalı

Reklam, ziyaretçiyi sitenize getirir. Site yavaşsa, mobilde bozuksa veya ne yapmasını istediğiniz belli değilse tıklamalar boşa gider. Önce site, sonra reklam.

## 7. Sonuç garantisi yok

"Şu kadar tıklama" ya da "şu kadar satış" garantisi veren bir söze güvenmeyin. Sonuç; sektörünüze, rekabete, bütçenize ve sitenizin kalitesine bağlıdır. Dürüst bir yönetici ölçülebilir bir kurulum yapar, düzenli iyileştirir ve ne olduğunu açıkça anlatır.

## Başlangıç için kontrol listesi

- Google Ads hesabı sizin adınıza mı?
- Aylık reklam bütçeniz belli mi?
- Hedef bölge ve hedef işlem net mi?
- Dönüşüm takibi kurulu mu?
- Site mobilde düzgün çalışıyor mu?`,
  },
  {
    slug: "alan-adi-kimin-adina-olmali",
    title: "Alan adı kimin adına olmalı? Sık yapılan pahalı hata",
    excerpt: "Alan adı firmanızın dijital adresi. Başkası adına kayıtlıysa, bir gün erişiminizi kaybedebilirsiniz.",
    category: "Web sitesi",
    daysAgo: 9,
    body: `Alan adı (ör. firmaadi.com) firmanızın internetteki adresidir ve markanızın bir parçasıdır. Yine de pek çok firma, alan adını web sitesini yapan kişi veya ajans adına kaydettirir. Bu, çoğu zaman yıllar sonra fark edilen pahalı bir hatadır.

## Başkası adına kayıtlı alan adının riskleri

- **Ayrılma zorluğu:** Ajansla yollarınızı ayırmak istediğinizde alan adını geri almak için pazarlık etmeniz gerekebilir.
- **Yenileme unutulması:** Süre dolduğunda yenilemeyi sizin göremediğiniz biri yapmak zorundadır. Unutulursa siteniz ve e-postalarınız bir anda kapanabilir.
- **Erişim kaybı:** Kayıt e-postası başkasında olduğu için alan adının yönetimine siz giremezsiniz.
- **Hukuki belirsizlik:** Uyuşmazlıkta alan adının sahibinin kim olduğu kanıtlanamayabilir.

## Doğru yöntem

1. Alan adı **firmanızın unvanı ya da sizin adınıza** kaydedilir. Kayıt belgesinde sahip olarak sizi görürsünüz.
2. Kayıt e-postası, **sizin kontrol ettiğiniz** bir adres olur.
3. Yenileme tarihini kendi takviminize yazarsınız.
4. Ajans, sizin verdiğiniz yetkiyle DNS ayarlarını yönetir; alan adının sahibi olmaz.

## Zaten başkası adına kayıtlıysa

Alan adını kaydeden kişiden "transfer kodu" (EPP kodu) isteyin ve alan adını kendi hesabınıza taşıyın. Çoğu zaman bu işlem birkaç gün içinde tamamlanır. Ne kadar erken yaparsanız o kadar kolaydır.

## Bizde nasıl işliyor?

Aboneliklerimizde alan adı **sizin adınıza** kaydedilir. Abonelik bittiğinde de sizde kalır. Zaten bir alan adınız varsa onu kullanırız; bunun için DNS yönetim erişiminizi bizimle paylaşmanız yeterli. Alan adı bilgilerinizi panelde başlangıç formunda girersiniz.`,
  },
  {
    slug: "mobil-uyumlu-site-neden-gerekli",
    title: "Mobil uyumlu site neden artık seçenek değil",
    excerpt: "Ziyaretçilerin çoğu telefondan geliyor. Siteniz telefonda zor kullanılıyorsa müşteri sizi bırakıp rakibe gider.",
    category: "Web sitesi",
    daysAgo: 14,
    body: `Bir müşteri ihtiyacı olduğunda ilk olarak telefonuna bakar. Aradığı hizmeti Google'da yazar, sonuçlardan birine dokunur. Siteniz telefonda zor kullanılıyorsa saniyeler içinde geri döner ve bir sonraki sonuca geçer.

## Mobil uyumlu ne demek?

Sitenin ekran boyutuna göre kendini düzenlemesi demektir. Telefonda yazılar okunur boyutta olur, menü kolay açılır, butonlara parmakla rahat basılır, yan kaydırma gerekmez.

## Telefonda şunlara bakın

- **Yazılar** yakınlaştırmadan okunuyor mu?
- **Butonlar ve bağlantılar** birbirine çok yakın değil mi, yanlışlıkla başka yere basıyor musunuz?
- **Telefon numarası** dokununca arama başlatıyor mu?
- **İletişim formu** küçük ekranda kolay doldurulabiliyor mu?
- **Sayfa hızı:** Mobil bağlantıda sayfa rahat açılıyor mu?
- **Görseller** ekrana sığıyor mu, taşan bir şey var mı?

## Arama motorları da buna bakar

Google, sitelerin mobil sürümünü değerlendirerek sıralama yapar. Mobilde kötü deneyim sunan bir site, arama sonuçlarında geride kalabilir. Bu bir sıralama garantisi değil ama mobil uyumsuzluk kesinlikle dezavantajdır.

## Reklam verecekseniz daha da önemli

Google Ads tıklamalarının önemli bir kısmı telefondan gelir. Mobilde kötü çalışan bir sayfaya her tıklama, boşa giden bütçe demektir. Reklam vermeden önce sitenizin telefonda düzgün çalıştığından emin olun.

## Hızlı kontrol

Siteyi kendi telefonunuzdan, bir de başka birinin telefonundan açın. Bir arkadaşınıza "bu firmanın telefon numarasını bul" deyin ve ne kadar sürdüğüne bakın. Zorlanıyorsa, ziyaretçileriniz de zorlanıyordur.

Tüm sitelerimizi mobil öncelikli tasarlıyoruz ve önizlemeyi onaylamadan önce telefonunuzda deneyebilirsiniz.`,
  },
  {
    slug: "google-ads-butcesi-nasil-belirlenir",
    title: "Google Ads bütçesi nasıl belirlenir?",
    excerpt: "Bütçeyi tahminle değil, hedefinizden geriye giderek belirleyin. Basit bir hesap yöntemi ve dikkat edilecek noktalar.",
    category: "Google Ads",
    daysAgo: 20,
    body: `"Aylık ne kadar bütçe ayırmalıyım?" sorusunun herkes için geçerli tek bir yanıtı yok. Ama bütçeyi tahmin etmek yerine hedefinizden geriye giderek mantıklı bir aralığa ulaşabilirsiniz.

## 1. Bir müşterinin sizin için değerini bilin

Bir müşteri size ortalama ne kadar kazandırıyor? Bu, ilk satıştan ya da hizmetten kalan net katkıdır. Bunu bilmeden bütçe belirlemek karanlıkta yürümek gibidir.

## 2. Bir müşteri için ne kadar harcayabileceğinizi belirleyin

Bir müşteri kazanmak için harcayabileceğiniz tutar, o müşterinin değerinden düşük olmalıdır. Örneğin bir müşteri size net 1.000 TL kazandırıyorsa, onu 300 TL'ye kazanmak kârlıdır, 1.200 TL'ye kazanmak değildir. (Bu rakamlar yalnızca hesabı göstermek için uydurulmuş bir örnektir; sizin sayılarınız farklı olacaktır.)

## 3. Telefon ve form dönüşüm oranını tahmin edin

Sitenize gelen ziyaretçilerin ne kadarının sizi aradığını ya da formu doldurduğunu bilmiyorsanız, ilk haftalar bunu ölçmek için kullanılır. Bu yüzden ilk dönem verisi değerlidir.

## 4. Hesabı tersten yapın

Aylık hedeflediğiniz müşteri sayısını, müşteri başına harcayabileceğiniz tutarla çarparsanız, makul bir aylık reklam bütçesi aralığı çıkar. Başlangıçta bunu bir üst sınır değil, öğrenme dönemi bütçesi olarak düşünün.

## Dikkat edilecek noktalar

- **Çok düşük bütçe:** Veri toplayamayacak kadar az tıklama gelir, optimizasyon yapılamaz.
- **Çok geniş hedefleme:** Bütçe, işinizle ilgisiz aramalara harcanır.
- **Bütçeyi sık değiştirmek:** Google'ın öğrenme sürecini bozar. Değişiklikleri veriye bakarak yapın.
- **Mevsimsellik:** Sektörünüzde yoğun dönemler varsa bütçeyi onlara göre planlayın.

## Bütçe kimin?

Reklam bütçesi sizindir ve Google tarafından doğrudan kartınızdan çekilir. Reklamları yöneten firmanın hizmet bedeli ayrıdır. Aylık bütçenizi siz belirler, istediğiniz zaman değiştirebilirsiniz.

## Sonuç

Önce hedefi ve müşteri değerini bilin, sonra bütçeyi buna göre belirleyin. İlk iki üç ayı öğrenme dönemi sayın ve gerçek veriye göre ayarlayın.`,
  },
  {
    slug: "web-sitesi-abonelik-mi-tek-seferlik-mi",
    title: "Web sitesi: abonelik mi, tek seferlik ödeme mi?",
    excerpt: "İki modelin artıları ve eksileri, hangi durumda hangisinin size uyduğu ve sözleşmede nelere bakmanız gerektiği.",
    category: "Karar rehberi",
    daysAgo: 27,
    body: `Web sitesi için iki temel model var: bir kerelik ücret ödeyip siteyi teslim almak ya da aylık abonelikle çalışmak. Hangisinin daha iyi olduğu, ihtiyacınıza bağlı.

## Tek seferlik ödeme

**Artıları**

- Tek ödeme, sonrasında sabit aylık gider yok (barındırma ve alan adı hariç).
- Site dosyaları genelde teslim edilir; siteyi başka biriyle devam ettirebilirsiniz.

**Eksileri**

- Başlangıçta büyük bir bütçe gerekir.
- Teslimden sonra bakım, güncelleme ve değişiklikler ayrıca ücretlendirilir veya ilgilenen olmaz.
- Site zamanla eskir, güvenlik güncellemeleri unutulur.

## Aylık abonelik

**Artıları**

- Başlangıç maliyeti düşüktür, gider her ay öngörülebilirdir.
- Bakım, güncelleme ve destek sürekli olarak hizmetin içindedir.
- Memnun kalmadığınızda çıkış koşulu belli olabilir.

**Eksileri**

- Uzun vadede toplam maliyet tek seferlik ödemeden yüksek olabilir.
- Abonelik bittiğinde site genellikle yayından kalkar; dosyalar size devredilmeyebilir.
- Taahhüt süresi varsa o süre boyunca bağlısınız.

## Hangisi size uyar?

Tek seferlik ödeme, teknik ekibi olan ve siteyi kendisi yönetebilecek firmalar için uygundur. Abonelik, siteyle uğraşmak istemeyen, bütçeyi yayıp öngörülebilir ödemek isteyen ve düzenli bakım bekleyen firmalar için uygundur.

## Sözleşmede bakılacaklar (hangi model olursa olsun)

- **Alan adı** kimin adına kayıtlı ve abonelik biterse kimde kalıyor?
- **Taahhüt süresi** var mı, memnun kalmazsanız çıkış yolu nedir?
- Aylık fiyat **taahhüt süresince sabit** mi?
- Neler **kapsam dışı** ve ek iş nasıl ücretlendiriliyor?
- Abonelik bitince **içeriklerinizi** alabiliyor musunuz?

## Bizim modelimiz

Biz abonelikle çalışıyoruz: 12 ay taahhüt, taahhüt boyunca sabit aylık bedel, alan adı sizin adınıza ve her zaman sizde, reklam bütçesi sizin. Memnun kalmazsanız panelden iptal talebi açarsınız; talep ekibimizce değerlendirilir. Koşulların hepsi [Paketler](/paketler) sayfasında ve sözleşmelerde açıkça yazıyor.`,
  },
];
