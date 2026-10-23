import type { FaqItem } from "@/components/faq";

export type Service = {
  slug: string;
  pictogram: "tasarim" | "reklam" | "bakim" | "arama";
  title: string;
  short: string;
  lead: string;
  does: { title: string; text: string }[];
  deliverables: string[];
  forWho: string[];
  notIncluded: string[];
  faq: FaqItem[];
  seoDescription: string;
};

export const servicesContent: Service[] = [
  {
    slug: "kurumsal-web-sitesi",
    pictogram: "tasarim",
    title: "Kurumsal web sitesi",
    short: "Firmanıza özel tasarlanmış, yayına alınmış ve bakımı bize ait site.",
    lead: "Hazır şablonu firmanıza giydirmiyoruz. Sektörünüzü, müşterinizi ve vermek istediğiniz mesajı dinleyip siteyi sıfırdan tasarlıyoruz; yayına alıyor, barındırıyor ve sonrasında bakımını yapıyoruz.",
    does: [
      { title: "Tasarım", text: "Başlangıç formunda anlattıklarınızdan yola çıkıp ana sayfa ve alt sayfaları tasarlarız. Önizleme size panelden gelir; beğenirseniz onaylar, değişiklik isterseniz revizyon talebi açarsınız." },
      { title: "İçerik düzeni", text: "Metinleri siz gönderebilir ya da bizden isteyebilirsiniz. Sayfa başlıkları, görsellerin yerleşimi ve iletişim yönlendirmeleri tasarımın parçasıdır." },
      { title: "Mobil uyum ve hız", text: "Site telefonda, tablette ve masaüstünde sorunsuz görünür. Görseller sıkıştırılır, gereksiz yük taşınmaz." },
      { title: "Yayın ve barındırma", text: "Siteyi sizin alan adınıza bağlar, güvenli bağlantıyla (HTTPS) yayına alırız. Barındırma abonelik içindedir." },
      { title: "Bakım", text: "Güncellemeler, güvenlik önlemleri ve küçük değişiklikler abonelik süresince bizdedir. Talebinizi panelden açarsınız." },
    ],
    deliverables: [
      "Firmanıza özel tasarlanmış, mobil uyumlu site",
      "Sizin adınıza kayıtlı alan adı ve güvenli bağlantı",
      "Arama motorlarının sitenizi anlaması için teknik altyapı",
      "İletişim formu ve (isterseniz) WhatsApp, telefon yönlendirmeleri",
      "Panelden destek ve değişiklik talebi",
    ],
    forWho: [
      "Henüz sitesi olmayan, ilk kurumsal sitesini yaptıracak firmalar",
      "Eski ve mobilde bozuk sitesini yenilemek isteyenler",
      "Bir kerelik büyük bütçe yerine aylık, öngörülebilir ödeme isteyenler",
      "Site bakımıyla uğraşmak istemeyenler",
    ],
    notIncluded: [
      "Paket kapsamını aşan işler (ör. çok sayıda ek sayfa ya da özel yazılım) ayrıca teklif edilir, onayınız olmadan yapılmaz.",
      "Ürün satışı yapılan e-ticaret altyapısı bu hizmetin kapsamında değildir.",
    ],
    faq: [
      { q: "Siteyi hazır şablondan mı yapıyorsunuz?", a: "Hayır. Tasarım firmanıza ve sektörünüze göre hazırlanır. Ortak yazılım bileşenleri kullanırız ama görünüm ve yerleşim sizin için kurgulanır." },
      { q: "Alan adı kimde kalır?", a: "Sizde. Alan adı sizin adınıza kaydedilir; abonelik bitse de size aittir." },
      { q: "Metinleri ben mi yazacağım?", a: "İsterseniz siz gönderirsiniz, isterseniz bizden yazmamızı istersiniz. Başlangıç formunda bunu seçersiniz." },
      { q: "Siteyi sonradan değiştirebilir miyim?", a: "Evet. Metin, görsel ve küçük düzen değişikliklerini panelden talep olarak iletirsiniz, abonelik süresince bizim tarafımızdan yapılır." },
    ],
    seoDescription: "Firmanıza özel tasarlanan, yayına alınan ve bakımı yapılan kurumsal web sitesi. Abonelik ya da tek seferlik paket, alan adı sizde kalır.",
  },
  {
    slug: "google-ads-yonetimi",
    pictogram: "reklam",
    title: "Google Ads yönetimi",
    short: "Hesabın kurulumu, reklam metinleri, anahtar kelimeler ve düzenli optimizasyon.",
    lead: "Reklam hesabı sizin adınıza açılır, reklam bütçesi kartınızdan doğrudan Google'a gider. Biz hesabı kurar, reklamları yazar, aramaları ve bölgeyi ayarlar ve düzenli olarak iyileştiririz.",
    does: [
      { title: "Hesap kurulumu", text: "Google Ads hesabınız yoksa sizin adınıza açılmasına yardım ederiz; varsa mevcut hesabı inceler, düzenleriz. Hesap her zaman size aittir." },
      { title: "Anahtar kelime ve reklam metni", text: "Hizmetlerinizi arayan kişilerin yazdığı aramaları belirler, bunlara uygun reklam metinleri hazırlarız." },
      { title: "Bölge ve hedef", text: "Reklamlar yalnızca hizmet verdiğiniz bölgede, hedeflediğiniz işlem için (arama, form, WhatsApp) gösterilir." },
      { title: "Dönüşüm takibi", text: "Telefon, form ve WhatsApp yönlendirmelerinin hangi reklamdan geldiğini ölçebilmeniz için gerekli takip kurulumunu yaparız." },
      { title: "Düzenli optimizasyon", text: "Fayda sağlamayan aramaları ve reklamları eleriz, bütçenin işe yarayan yere gitmesi için düzenli ayar yaparız." },
    ],
    deliverables: [
      "Size ait, düzgün yapılandırılmış Google Ads hesabı",
      "Hedef aramalara göre hazırlanmış kampanya ve reklam metinleri",
      "Telefon, form ve WhatsApp için dönüşüm takibi",
      "Aylık performans raporu: harcama, tıklama ve dönüşüm özeti",
      "Reklamla ilgili sorularınız için panelden destek",
    ],
    forWho: [
      "Yerel müşteri arayan hizmet firmaları (klinik, hukuk bürosu, atölye, kurs vb.)",
      "Sitesi hazır ama ziyaretçi getiremeyenler",
      "Reklam bütçesini kendi kontrolünde tutmak isteyenler",
    ],
    notIncluded: [
      "Reklam bütçesi hizmet bedeline dahil değildir. Siz belirlersiniz ve kartınızdan doğrudan Google'a ödersiniz.",
      "Belirli sayıda tıklama, arama ya da satış garantisi verilmez; sonuç sektöre, rekabete ve bütçeye göre değişir.",
    ],
    faq: [
      { q: "Reklam bütçesini kim öder?", a: "Siz. Google, harcamayı doğrudan sizin kartınızdan çeker. Bize ödediğiniz aylık bedel yalnızca hizmet bedelidir." },
      { q: "Hesap kimde olur?", a: "Sizde. Hesabın sahibi sizsiniz; biz yalnızca yönetim erişimiyle çalışırız. Abonelik biterse erişimi kaldırırız, hesabınız ve geçmişi sizde kalır." },
      { q: "Ne kadar bütçeyle başlamalıyım?", a: "Sektörünüze ve bölgenize bağlı. Başlangıç formunda hedef aylık bütçenizi yazarsınız; gerçekçi olup olmadığını sizinle konuşuruz." },
      { q: "Sonuç garantisi veriyor musunuz?", a: "Hayır. Kimsenin dürüstçe verebileceği bir garanti değil. Ölçülebilir bir kurulum yapar, düzenli iyileştirir ve ne olduğunu şeffaf biçimde anlatırız." },
    ],
    seoDescription: "Google Ads hesabı kurulumu, reklam metinleri, anahtar kelime ve bölge ayarı, dönüşüm takibi ve düzenli optimizasyon. Reklam bütçesi size aittir.",
  },
  {
    slug: "bakim-ve-destek",
    pictogram: "bakim",
    title: "Bakım ve destek",
    short: "Güncelleme, yedekleme ve değişiklik taleplerini panelden karşılıyoruz.",
    lead: "Site yayına girdikten sonra iş bitmez. Güncellemeler, güvenlik, yedekler ve sizin değişiklik istekleriniz abonelik boyunca bizdedir; her şeyi tek bir panelden takip edersiniz.",
    does: [
      { title: "Teknik bakım", text: "Altyapı ve yazılım güncellemeleri, güvenlik önlemleri ve sitenin sorunsuz çalışmasını izleme." },
      { title: "Değişiklik talepleri", text: "Metin, görsel, telefon numarası, çalışma saati gibi değişiklikleri panelden talep açarak iletirsiniz." },
      { title: "Destek paneli", text: "Taleplerinizi tek yerden açar, yazışmayı ve dosyaları orada tutar, durumunu görürsünüz. E-posta zincirleri arasında kaybolmazsınız." },
      { title: "Ödeme ve fatura", text: "Aylık ödemeleriniz, faturalarınız ve kart güncellemeniz panelde. Faturanızı oradan indirirsiniz." },
    ],
    deliverables: [
      "Abonelik süresince bakım ve güncellemeler",
      "Talep takibi: açık, yanıtlandı, kapandı",
      "Dosya ekleyerek talep açma",
      "Taleplerinize 2 iş günü içinde dönüş",
    ],
    forWho: ["Sitesini bir kez yaptırıp sonra sahipsiz kalmaktan yorulanlar", "Teknik işlerle uğraşmak istemeyenler"],
    notIncluded: ["Paket kapsamını aşan yeni sayfa ve özellik istekleri ayrıca teklif edilir."],
    faq: [
      { q: "Değişiklik için nasıl ulaşırım?", a: "Panelinizden yeni talep açarsınız. Kategori seçer, konuyu ve mesajınızı yazar, istersen dosya eklersiniz." },
      { q: "Taleplere ne kadar sürede dönüyorsunuz?", a: "Talepler iş günlerinde yanıtlanır, hedefimiz 2 iş günüdür. Üç günü aşan talepler için ekibimize otomatik hatırlatma gider." },
      { q: "Yedekleme yapılıyor mu?", a: "Evet, site içeriği ve veritabanı düzenli olarak yedeklenir; yedekler en az haftalık alınır." },
    ],
    seoDescription: "Web sitesi bakımı, güncelleme ve değişiklik talepleri tek panelden. Abonelik süresince bakım bizde.",
  },
  {
    slug: "arama-motoru-uyumu",
    pictogram: "arama",
    title: "Arama motoru uyumu",
    short: "Sitenizin Google'da bulunabilmesi için teknik altyapı.",
    lead: "Her sitemiz arama motorlarının anlayacağı biçimde kurulur. Bu, bir sıralama garantisi değil; sitenizin Google tarafından düzgün taranıp anlaşılabilmesi için yapılması gereken teknik işlerdir.",
    does: [
      { title: "Teknik altyapı", text: "Doğru başlık yapısı, sayfa başlıkları ve açıklamaları, site haritası, düzgün adresler ve yapılandırılmış veri." },
      { title: "Hız ve mobil uyum", text: "Hızlı açılan, mobilde rahat kullanılan sayfalar. Google bunu değerlendirmede dikkate alır." },
      { title: "Google araçlarının kurulumu", text: "Sitenizin Google tarafından tanınması için gerekli doğrulama ve site haritası gönderimi." },
      { title: "Yerel görünürlük", text: "Firma bilgilerinizin (adres, telefon, çalışma saatleri) site ve Google işletme profilinizle tutarlı olması için yönlendirme." },
    ],
    deliverables: [
      "Arama motoru uyumlu sayfa yapısı ve meta bilgileri",
      "Site haritası ve robots ayarı",
      "Firma bilgileri için yapılandırılmış veri",
      "Google Search Console doğrulaması",
    ],
    forWho: ["Sitesinin Google'da bulunmasını isteyen herkes", "Yerel aramalarda görünmek isteyen firmalar"],
    notIncluded: [
      "Belirli bir anahtar kelimede belirli bir sıra garantisi verilmez; sıralamayı yüzlerce etken belirler.",
      "Düzenli içerik üretimi (blog yazıları vb.) bu hizmetin kapsamında değildir, ayrıca konuşulur.",
    ],
    faq: [
      { q: "Sitem Google'da ilk sırada çıkar mı?", a: "Bunu kimse dürüstçe garanti edemez. Biz sitenizin teknik olarak Google'a hazır olmasını sağlarız; sıralama içeriğe, rekabete ve zamana göre değişir." },
      { q: "Google Ads ile arasındaki fark ne?", a: "Arama motoru uyumu, organik (ücretsiz) sonuçlarda bulunabilirlik içindir ve zaman alır. Google Ads, ücretli reklamdır ve hemen görünür; bütçeniz harcandığı sürece." },
    ],
    seoDescription: "Kurumsal sitenizin Google'da bulunabilmesi için teknik arama motoru uyumu: yapı, hız, site haritası ve yapılandırılmış veri.",
  },
];

export const getService = (slug: string) => servicesContent.find((s) => s.slug === slug);
