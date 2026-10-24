import { company } from "@/lib/site";

/*
 * Hukuki metinler. Firma kimliği lib/site.ts içindeki `company`dan gelir; metinlerin geri kalanı hazırdır.
 * Yayına almadan önce bir avukat tarafından gözden geçirilmelidir (docs/CANLIYA-GECIS.md).
 * Metin değişince lib/legal.ts içindeki sürüm artırılır: onay kayıtları hangi sürümün kabul edildiğini tutar.
 */

export type LegalSection = { heading: string; paragraphs: string[]; list?: string[] };
export type LegalDoc = { slug: string; title: string; description: string; intro?: string; sections: LegalSection[] };

const c = company;

const providerBlock = [
  `Unvan: ${c.legalName} (${c.tradeName})`,
  `Vergi dairesi${c.taxNumber ? " ve numarası" : ""}: ${c.taxOffice}${c.taxNumber ? ` / ${c.taxNumber}` : ""}`,
  ...(c.mersis ? [`MERSİS numarası: ${c.mersis}`] : []),
  `Adres: ${c.address}`,
  ...(c.kep ? [`KEP adresi: ${c.kep}`] : []),
  `Telefon: ${c.phone}`,
  `E-posta: ${c.email}`,
  `İnternet sitesi: ${c.website}`,
];

const SERVICE_DEFINITION =
  "Hizmet; müşterinin seçtiği pakete göre kurumsal web sitesinin tasarlanması, yayına alınması, barındırılması ve bakımının yapılması ile (Google Ads yönetimi içeren paketlerde) müşterinin Google Ads hesabının kurulması ve yönetilmesidir. Seçilen paketin kapsamı, sipariş sırasında ve sitedeki paket sayfasında gösterilir.";

export const mesafeliSatis: LegalDoc = {
  slug: "mesafeli-satis",
  title: "Mesafeli hizmet satış sözleşmesi",
  description: "Kaşif Yazılım abonelik hizmetine ilişkin mesafeli hizmet satış sözleşmesi.",
  intro:
    "Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak düzenlenmiştir. Sipariş verirken onay kutusunu işaretlemeniz, sözleşmeyi okuyup kabul ettiğiniz anlamına gelir.",
  sections: [
    {
      heading: "Taraflar",
      paragraphs: ["SATICI (Hizmet sağlayıcı):"],
      list: [...providerBlock],
    },
    {
      heading: "Alıcı",
      paragraphs: [
        "ALICI; sitemizden abonelik siparişi veren, sipariş formunda unvanı, vergi bilgileri, adresi ve iletişim bilgileri belirtilen gerçek veya tüzel kişidir. Alıcının bilgileri sipariş sırasında girdiği bilgilerdir ve sözleşmenin ayrılmaz parçasıdır. Alıcı bu bilgilerin doğruluğunu taahhüt eder.",
        "Alıcı bir ticari işletme olarak hizmet alıyorsa 6502 sayılı Kanun'un tüketiciye tanıdığı korumalar yalnızca Kanun'un kapsamına girdiği ölçüde uygulanır; diğer hükümler Türk Borçlar Kanunu ve Türk Ticaret Kanunu çerçevesinde uygulanır.",
      ],
    },
    {
      heading: "Sözleşmenin konusu",
      paragraphs: [
        "Bu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden sipariş verdiği aylık abonelik hizmetinin sunulmasına, bedelinin ödenmesine ve tarafların hak ve yükümlülüklerine ilişkin esasların belirlenmesidir.",
        SERVICE_DEFINITION,
      ],
    },
    {
      heading: "Hizmetin kapsamı ve sunumu",
      paragraphs: [
        "Hizmetin kapsamı, ALICI'nın sipariş sırasında seçtiği paketin sitedeki tanımıyla belirlenir. Paket tanımında yer almayan işler (ör. paket kapsamını aşan sayfa ve işlevler, ek tasarım çalışmaları) ayrıca teklif edilir ve ALICI onaylamadıkça yapılmaz.",
        "Hizmet fiziki bir teslimat içermez; elektronik ortamda sunulur. SATICI, siteyi tasarlayıp yayına almak için ALICI'dan başlangıç formunda bilgi, içerik ve görsel talep eder. Hizmetin başlangıcı için ALICI'nın taahhütnameyi imzalayıp yüklemesi ve SATICI'nın bunu onaylaması gerekir; onaylanmadan tasarım aşamasına geçilmez.",
        "Sitenin tahmini yayın süresi, içerik ve bilgilerinizin eksiksiz ulaşmasından itibaren 10 ila 15 iş günüdür. Bu süre, ALICI'nın bilgi, içerik ve onaylarını zamanında iletmesine bağlıdır; ALICI kaynaklı gecikmeler süreye eklenir.",
        "Destek talepleri ALICI'nın paneli üzerinden alınır ve iş günlerinde yanıtlanır.",
      ],
    },
    {
      heading: "Abonelik süresi ve taahhüt",
      paragraphs: [
        "Abonelik, ödemenin ilk kez başarıyla alındığı tarihte başlar ve 12 (on iki) aylık taahhüt süresi içerir. ALICI, taahhüt süresi boyunca aylık hizmet bedelini ödemeyi kabul eder.",
        "Taahhüt süresi sonunda abonelik, ALICI aksini bildirmedikçe aynı koşullarla ay ay devam edebilir; devam eden dönemde ALICI aboneliğini panelinden sonlandırma talebiyle bir sonraki ödeme tarihinden önce sonlandırabilir.",
        "Taahhüt süresi içindeki fiyat, ALICI'nın sipariş sırasında onayladığı aylık bedeldir ve taahhüt süresi boyunca artırılmaz.",
      ],
    },
    {
      heading: "Bedel ve ödeme",
      paragraphs: [
        "Aylık hizmet bedeli, sipariş sırasında seçilen paketin sitede gösterilen bedelidir. Fiyatlara KDV dahil değildir; fatura yürürlükteki oranda KDV eklenerek düzenlenir; bu durum sipariş ekranında da belirtilir.",
        "Bedel, taahhüt süresince her ay ALICI'nın kartından 6493 sayılı Kanun kapsamında faaliyet gösteren ödeme kuruluşu iyzico aracılığıyla otomatik olarak tahsil edilir. Kart bilgileri SATICI tarafından görülmez ve saklanmaz; yalnızca iyzico'nun güvenli ödeme formuna girilir. ALICI, kartının her ay otomatik olarak borçlandırılacağını bilerek ve açıkça kabul eder.",
        "Aylık çekim başarısız olursa iyzico çekimi yeniden dener ve ALICI'ya kartını panelden güncelleme imkanı verilir. Ödeme makul bir süre içinde alınamazsa SATICI, ALICI'ya bildirimde bulunarak hizmeti ödeme alınana kadar askıya alabilir; ödenmeyen aylar için bedel talep hakkı saklıdır.",
        "Faturalar ödeme sonrasında hazırlanır ve ALICI'nın panelinden indirilebilir.",
      ],
    },
    {
      heading: "Reklam bütçesi",
      paragraphs: [
        "Google Ads yönetimi içeren paketlerde reklam bütçesi, aylık hizmet bedeline dahil değildir ve ALICI'ya aittir. Reklam harcaması, ALICI'nın Google Ads hesabına tanımlı kartından doğrudan Google'a ödenir; SATICI reklam harcamasını tahsil etmez, aracılık etmez ve ALICI adına ödemez.",
        "SATICI, ALICI'nın belirlediği aylık reklam bütçesi sınırları içinde hareket eder. Google'ın fiyatlandırması, reklam politikaları ve hesap kararları SATICI'nın kontrolünde değildir.",
        "SATICI, reklamların belirli sayıda tıklama, arama, form veya satış getireceğini taahhüt etmez ve garanti vermez; reklam performansı sektöre, rekabete, bütçeye ve site içeriğine göre değişir.",
      ],
    },
    {
      heading: "Alan adı",
      paragraphs: [
        "Alan adı ALICI adına kaydedilir ve ALICI'ya aittir. Abonelik sona erse de alan adı ALICI'da kalır. ALICI'nın mevcut alan adını kullanması halinde SATICI'ya gerekli DNS ve yönetim erişimlerini vermesi gerekir. Yeni bir alan adı gerekirse kayıt ve yenileme bedeli, kayıttan önce ALICI'ya bildirilir ve ALICI'nın onayıyla alınır; bedel alan adı sağlayıcısının güncel fiyatıdır.",
      ],
    },
    {
      heading: "Alıcının yükümlülükleri",
      paragraphs: [
        "ALICI; sipariş ve başlangıç formundaki bilgilerin doğru ve güncel olmasından, SATICI'ya ilettiği metin, görsel, logo ve diğer içeriklerin hukuka uygunluğundan ve bu içerikler üzerinde üçüncü kişilerin hakkını ihlal etmediğinden sorumludur.",
        "ALICI, istenen bilgi, içerik, erişim ve onayları zamanında iletmeyi, tasarım önizlemelerini makul sürede onaylamayı veya revizyon talebini bildirmeyi kabul eder. Panele giriş bilgilerinin gizliliği ALICI'nın sorumluluğundadır.",
        "Reklam hizmeti alan ALICI, Google Ads hesabının sahibi olarak Google'ın hizmet şartlarına ve reklam politikalarına uymakla yükümlüdür; reklamı yapılan ürün ve hizmetlerin hukuka uygunluğundan sorumludur.",
      ],
    },
    {
      heading: "Satıcının yükümlülükleri",
      paragraphs: [
        "SATICI; hizmeti özenle ve işin gereklerine uygun biçimde sunmayı, ALICI'nın taleplerini panel üzerinden yanıtlamayı, sitenin yayında kalması ve güvenliği için makul teknik önlemleri almayı üstlenir.",
        "Planlı bakım ve SATICI'nın kontrolü dışındaki sebeplerle (barındırma, alan adı ve ağ sağlayıcıları, mücbir sebepler) oluşabilecek kesintilerden doğan zararlardan SATICI, kasıt veya ağır kusuru bulunmadıkça sorumlu tutulamaz.",
      ],
    },
    {
      heading: "Fikri mülkiyet",
      paragraphs: [
        "ALICI'nın sağladığı metin, görsel, logo, marka ve diğer içeriklerin hakları ALICI'da kalır; ALICI, bunların siteye ve reklamlara yerleştirilmesi için SATICI'ya sınırlı kullanım izni verir.",
        "SATICI'nın ALICI için hazırladığı site tasarımı ve yazılımı, abonelik süresince ALICI'nın kendi sitesinde kullanması için verilen devredilemez bir kullanım lisansıyla sunulur. Abonelik sona erdiğinde site yayından kaldırılır; ALICI, talep etmesi halinde kendi içeriklerinin ve alan adının teslimini isteyebilir.",
        "SATICI'nın ortak yazılım bileşenleri, şablonları ve genel bilgi birikimi üzerindeki hakları SATICI'da kalır.",
      ],
    },
    {
      heading: "Cayma hakkı ve iptal",
      paragraphs: [
        "ALICI tüketici sıfatını taşıyorsa, sözleşmenin kurulduğu tarihten itibaren on dört gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir. Hizmet sözleşmelerinde, ALICI'nın onayıyla cayma süresi dolmadan hizmetin ifasına başlanması halinde, cayma hakkının kullanılması durumunda ALICI cayma bildirimine kadar ifa edilen hizmetin bedelini öder. Hizmet ifa edildikten sonra cayma hakkı Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesindeki istisnalar çerçevesinde sona erebilir.",
        "ALICI, sözleşmenin ayrılmaz parçası olan Ön Bilgilendirme Formu'nda ve İptal, Cayma ve İade Koşulları sayfasında anlatılan usulle cayma hakkını kullanabilir. Bu hakkın yanı sıra SATICI, taahhüt süresi içinde memnun kalmayan ALICI'ya sözleşmesel memnuniyet iptali imkanı tanır: ALICI panelinden gerekçeli iptal talebi açar; talep SATICI yetkilisince değerlendirilir ve onaylanırsa iyzico aboneliği iptal edilip hizmetler sona erdirilir. İptal talebi açmak aboneliği kendiliğinden sonlandırmaz; onay verilene kadar hizmet ve aylık çekim devam eder.",
      ],
    },
    {
      heading: "Sözleşmenin sona ermesi",
      paragraphs: [
        "Sözleşme; tarafların anlaşması, memnuniyet iptalinin onaylanması, taahhüt süresi sonunda ALICI'nın aboneliği sonlandırması veya haklı fesih sebepleriyle sona erer. Haklı fesih halleri; ödemenin uzun süre alınamaması, ALICI'nın hukuka aykırı içerik sağlaması, gerçek dışı bilgi vermesi ve sözleşmeye aykırılığın bildirime rağmen giderilmemesidir.",
        "Sona erme halinde SATICI ALICI'nın alan adı ile içeriklerinin teslimi konusunda makul destek verir; iyzico aboneliği iptal edilir. Önceden ödenmiş ve ifa edilmiş dönemlerin bedeli, İptal, Cayma ve İade Koşulları'nda belirtilen haller dışında iade edilmez.",
      ],
    },
    {
      heading: "Kişisel verilerin korunması",
      paragraphs: [
        "ALICI'nın kişisel verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na uygun olarak KVKK Aydınlatma Metni'nde belirtilen amaçlarla işlenir. ALICI, siteye veya reklamlara girdiği üçüncü kişilere ait kişisel verilerin hukuka uygun olarak elde edildiğinden ve işlenmesine yetkisi bulunduğundan sorumludur.",
      ],
    },
    {
      heading: "Mücbir sebep",
      paragraphs: [
        "Tarafların kontrolü dışında gelişen ve makul önlemlerle engellenemeyen olaylar (doğal afet, savaş, salgın, genel elektrik ve internet kesintisi, kamu otoritesi kararları, barındırma veya ödeme altyapısı sağlayıcılarının genel kesintileri gibi) mücbir sebep sayılır. Mücbir sebep süresince yükümlülükler askıya alınır; mücbir sebep otuz günden uzun sürerse taraflar sözleşmeyi feshedebilir.",
      ],
    },
    {
      heading: "Sorumluluğun sınırı",
      paragraphs: [
        "SATICI'nın sözleşmeden doğan sorumluluğu, kasıt ve ağır kusur halleri ile kanunen sınırlanamayacak haller saklı kalmak üzere, sorumluluğa yol açan olayın gerçekleştiği dönem için ALICI'nın ödediği hizmet bedeliyle sınırlıdır. SATICI, dolaylı zararlardan, kâr kaybından ve reklam sonuçlarından sorumlu değildir.",
      ],
    },
    {
      heading: "Bildirimler",
      paragraphs: [
        "Taraflar arasındaki bildirimler, ALICI'nın sipariş sırasında verdiği e-posta adresi, panel mesajları ve SATICI'nın yukarıda belirtilen adresleri üzerinden yapılır. ALICI, iletişim bilgilerindeki değişikliği derhal bildirmekle yükümlüdür.",
      ],
    },
    {
      heading: "Uyuşmazlıkların çözümü",
      paragraphs: [
        "Bu sözleşmeden doğan uyuşmazlıklarda, ALICI tüketici ise her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dahilinde ALICI'nın yerleşim yerindeki veya sözleşmenin yapıldığı yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir. ALICI tüketici değilse SATICI'nın bulunduğu yerdeki mahkemeler ve icra daireleri yetkilidir.",
      ],
    },
    {
      heading: "Yürürlük",
      paragraphs: [
        "ALICI, sipariş sırasında bu sözleşmeyi elektronik ortamda okuyup onayladığını kabul eder. Onay; belge türü, sürümü, tarih, saat, IP adresi ve kullanıcı hesabıyla birlikte kayıt altına alınır. Sözleşme, onay anında yürürlüğe girer.",
      ],
    },
  ],
};

export const onBilgilendirme: LegalDoc = {
  slug: "on-bilgilendirme",
  title: "Ön bilgilendirme formu",
  description: "Mesafeli hizmet satışı öncesinde tüketiciye verilen ön bilgilendirme formu.",
  intro:
    "Bu form, Mesafeli Sözleşmeler Yönetmeliği uyarınca sipariş vermeden önce sizi bilgilendirmek için hazırlanmıştır. Siparişi tamamladığınızda bu formu okuduğunuzu ve elektronik ortamda onayladığınızı kabul etmiş olursunuz.",
  sections: [
    { heading: "Satıcı bilgileri", paragraphs: ["Satıcının kimliği ve iletişim bilgileri:"], list: [...providerBlock] },
    {
      heading: "Hizmetin temel nitelikleri",
      paragraphs: [
        SERVICE_DEFINITION,
        "Hizmet elektronik ortamda sunulur, fiziki teslimat yoktur. Hizmetin başlaması için taahhütnamenin imzalı olarak yüklenip onaylanması ve başlangıç formunun doldurulması gerekir. Tahmini yayın süresi, içerik ve bilgilerinizin eksiksiz ulaşmasından itibaren 10 ila 15 iş günüdür.",
      ],
    },
    {
      heading: "Toplam bedel, ödeme ve taahhüt",
      paragraphs: [
        "Aylık hizmet bedeli, sipariş ekranında seçtiğiniz paketin bedelidir; fiyatlara KDV dahil değildir; fatura yürürlükteki oranda KDV eklenerek düzenlenir. Abonelik 12 aylık taahhüt içerir; toplam yükümlülük, aylık bedelin on iki ayla çarpımıdır.",
        "Bedel, taahhüt süresince her ay kartınızdan iyzico aracılığıyla otomatik olarak çekilir. Ödeme yöntemi: kredi veya banka kartı. Taksit uygulanmaz, bedel aylık eşit tutarlarla tahsil edilir.",
        "Google Ads reklam bütçesi aylık bedele dahil değildir; reklam harcamanız kartınızdan doğrudan Google'a ödenir.",
        "Pakette \"+ alan adı ücreti\" belirtilmişse alan adı kayıt ve yenileme ücreti paket bedeline dahil değildir; kayıttan önce size bildirilir ve onayınızla alınır.",
        "Sipariş ekranındaki toplam bedel ve ödeme planı, bu formdaki bilgilerin güncel halidir.",
      ],
    },
    {
      heading: "Cayma hakkı",
      paragraphs: [
        "Tüketici olarak sözleşmenin kurulduğu tarihten itibaren on dört gün içinde, herhangi bir gerekçe göstermeden ve cezai şart ödemeden cayma hakkınızı kullanabilirsiniz. Cayma süresi içinde, sizin onayınızla hizmetin ifasına başlanmışsa cayma halinde cayma bildirimine kadar ifa edilen hizmetin bedelini ödersiniz. Hizmet tamamen ifa edilmişse veya yönetmeliğin 15. maddesinde sayılan istisnalar gerçekleşmişse cayma hakkı sona erer.",
        "Cayma hakkınızı, bu formun sonundaki usulle, yazılı olarak veya panelinizden destek talebi açarak kullanabilirsiniz.",
        "Siparişi onaylamanızla birlikte, cayma süresi dolmadan hizmetin ifasına başlanmasını talep ettiğinizi ve bu durumda yukarıdaki bedel yükümlülüğünü kabul ettiğinizi beyan edersiniz.",
      ],
    },
    {
      heading: "Cayma bildirimi nasıl yapılır",
      paragraphs: [
        "Cayma bildiriminizi aşağıdaki kanallardan birine, cayma süresi dolmadan iletin. Bildirimde unvanınızı, e-posta adresinizi, sipariş tarihini ve caydığınızı açıkça belirtin:",
      ],
      list: [`E-posta: ${c.email}`, ...(c.kep ? [`KEP: ${c.kep}`] : []), `Posta: ${c.address}`, "Panel: Destek > Yeni talep > Fatura ve ödeme"],
    },
    {
      heading: "Memnuniyet iptali (sözleşmesel hak)",
      paragraphs: [
        "Yasal cayma hakkından bağımsız olarak, 12 aylık taahhüt süresi içinde memnun kalmazsanız panelinizden gerekçeli iptal talebi açabilirsiniz. Talep hemen iptal etmez; ekibimiz değerlendirir, onaylanırsa abonelik iptal edilir ve hizmetler sona erer. Alan adınız size aittir ve sizde kalır.",
      ],
    },
    {
      heading: "Şikayet ve uyuşmazlık",
      paragraphs: [
        "Şikayetlerinizi yukarıdaki iletişim bilgilerinden iletebilirsiniz. Tüketici olarak uyuşmazlıklarda, her yıl Ticaret Bakanlığı tarafından belirlenen parasal sınırlar dahilinde yerleşim yerinizdeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetine ya da Tüketici Mahkemesine başvurabilirsiniz.",
      ],
    },
    {
      heading: "Onay",
      paragraphs: [
        "Bu ön bilgilendirme formunu, sipariş vermeden önce elektronik ortamda okuduğumu ve hizmetin temel nitelikleri, toplam bedeli, ödeme ve ifa şekli, cayma hakkı ve kullanım şartları hakkında bilgilendirildiğimi kabul ederim.",
      ],
    },
  ],
};

export const iptalIade: LegalDoc = {
  slug: "iptal-iade",
  title: "İptal, cayma ve iade koşulları",
  description: "Abonelik iptali, cayma hakkı, memnuniyet iptali ve iade koşulları.",
  intro: "Aboneliğinizi nasıl iptal edebileceğinizi, hangi durumda ne kadar iade alacağınızı bu sayfada açıkça yazıyoruz.",
  sections: [
    {
      heading: "Dört farklı durum",
      paragraphs: ["Aboneliğiniz dört farklı yolla sona erebilir. Aşağıda her birinin koşulları var:"],
      list: [
        "14 günlük yasal cayma hakkı (tüketiciler için)",
        "12 ay içinde memnuniyet iptali (sözleşmesel hak, onaya bağlı)",
        "Taahhüt süresi sonunda sonlandırma",
        "Haklı sebeple fesih",
      ],
    },
    {
      heading: "Yasal cayma hakkı",
      paragraphs: [
        "Tüketici olarak, abonelik siparişinizden itibaren 14 gün içinde gerekçe göstermeden cayabilirsiniz. Cayma bildirimini e-posta, KEP veya panelinizdeki destek talebiyle yapabilirsiniz.",
        "Siparişte hizmetin cayma süresi dolmadan başlamasını onayladığınız için, cayma halinde cayma bildirimine kadar yapılan işin bedeli ödenir; geri kalan tutar, bildirimden itibaren en geç 14 gün içinde ödeme yaptığınız karta iade edilir. Bu hesap, sunulan hizmetin (tasarım çalışması, kurulum, geçen süre) toplam hizmete oranına göre yapılır ve size gerekçesiyle bildirilir.",
        "Hizmet tamamen ifa edildiyse veya Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesindeki istisnalardan biri gerçekleştiyse cayma hakkı sona erer. Ticari işletmeler için yasal cayma hakkı bulunmaz; bu durumda aşağıdaki memnuniyet iptali geçerlidir.",
      ],
    },
    {
      heading: "Memnuniyet iptali",
      paragraphs: [
        "12 aylık taahhüt süresi içinde hizmetten memnun kalmazsanız panelinizden iptal talebi açabilirsiniz. İptal nedeninizi yazmanız gerekir; böylece sorunu çözme veya hizmeti iyileştirme fırsatı buluruz.",
        "İptal talebi aboneliği anında sonlandırmaz. Talebiniz ekibimize iletilir ve yöneticimiz tarafından değerlendirilir. Onaylanırsa iyzico aboneliğiniz iptal edilir, aylık çekim durur ve hizmetlerimiz sona erer; kabul edilmezse nedeni size yazılı olarak bildirilir ve abonelik devam eder. Karar verilene kadar hizmet ve aylık çekim sürer.",
        "Onaylanan memnuniyet iptalinde, iptal tarihinden sonraki dönemler için ödeme alınmaz. Ödenmiş ve hizmeti sunulmuş aylar iade edilmez.",
      ],
    },
    {
      heading: "Taahhüt süresi sonunda sonlandırma",
      paragraphs: [
        "12 aylık taahhüt dolduktan sonra aboneliğinizi, bir sonraki çekim tarihinden önce panelinizden sonlandırma talebiyle bitirebilirsiniz. Bitiş tarihinden sonraki ay için ödeme alınmaz.",
      ],
    },
    {
      heading: "Haklı sebeple fesih",
      paragraphs: [
        "Taraflardan biri, sözleşmeye aykırılığın yazılı bildirime rağmen makul sürede giderilmemesi halinde sözleşmeyi haklı sebeple feshedebilir. Sunulması mümkün olmayan bir hizmet için alınan bedel iade edilir.",
      ],
    },
    {
      heading: "Alan adı ve içeriğiniz",
      paragraphs: [
        "Hangi yolla sona ererse ersin alan adınız size aittir ve sizde kalır. Sağladığınız metin, görsel ve logoların hakları size aittir. Aboneliğiniz sona erdiğinde siteniz yayından kaldırılır; talep ederseniz içeriklerinizi ve alan adı yönetim erişimlerini size teslim etmek için makul destek veririz.",
      ],
    },
    {
      heading: "Google Ads hesabınız",
      paragraphs: [
        "Google Ads hesabı size aittir. Abonelik sona erdiğinde hesabınıza tanıdığınız yönetim erişimini kaldırırız; hesap, geçmişi ve kampanyalarınız sizde kalır. Reklam harcaması doğrudan Google'a ödendiği için bizden iade konusu değildir; Google ile ilgili iade ve itirazlar Google'a yapılır.",
      ],
    },
    {
      heading: "İade nasıl yapılır",
      paragraphs: [
        "İadeler, ödemenin yapıldığı karta, iade onayından itibaren en geç 14 gün içinde iyzico aracılığıyla yapılır. Bankanıza bağlı olarak kart ekstrenize yansıması ek süre alabilir. Kısmi iade tutarı ve hesabı size yazılı olarak bildirilir.",
      ],
    },
    {
      heading: "İletişim",
      paragraphs: [`İptal, cayma ve iade soruları için panelinizdeki Destek bölümünü veya ${c.email} adresini kullanabilirsiniz.`],
    },
  ],
};

export const kvkk: LegalDoc = {
  slug: "kvkk",
  title: "KVKK aydınlatma metni",
  description: "Kişisel verilerinizin hangi amaçla, nasıl işlendiğine dair aydınlatma metni.",
  intro: "6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi uyarınca, kişisel verilerinizin nasıl işlendiğini bu metinle bildiriyoruz.",
  sections: [
    {
      heading: "Veri sorumlusu",
      paragraphs: ["Kişisel verileriniz, veri sorumlusu sıfatıyla aşağıdaki firma tarafından işlenir:"],
      list: [...providerBlock],
    },
    {
      heading: "İşlenen kişisel veriler",
      paragraphs: ["Hizmet sunarken şu veri kategorilerini işleriz:"],
      list: [
        "Kimlik ve iletişim: ad soyad, e-posta, telefon, yetkili kişi bilgileri",
        "Firma ve fatura: ticari unvan, vergi dairesi ve numarası, adres",
        "Müşteri işlemi: aldığınız paket, abonelik ve ödeme durumu, destek talepleri ve mesajlar, panelde yaptığınız işlemler, yüklediğiniz belgeler (taahhütname, logo, fotoğraf, fatura)",
        "İşlem güvenliği: IP adresi, tarayıcı bilgisi, oturum kayıtları, sözleşme onay kayıtları (belge, sürüm, tarih, IP)",
        "Ödeme: kart bilgileriniz yalnızca ödeme kuruluşu iyzico'nun güvenli formuna girilir ve bizde saklanmaz; biz yalnızca ödemenin sonucunu, tutarını ve tarihini alırız",
        "Başlangıç formu: sitenizde ve reklamlarınızda kullanılacak firma tanıtımı, sektör, hizmetler, bölge, alan adı ve reklam hedefleri gibi bilgiler",
      ],
    },
    {
      heading: "İşleme amaçları",
      paragraphs: ["Kişisel verileriniz şu amaçlarla işlenir:"],
      list: [
        "Abonelik sözleşmesinin kurulması ve ifası, sitenizin tasarlanması, yayınlanması ve bakımı, Google Ads hesabınızın yönetilmesi",
        "Ödemelerin tahsili, faturalandırma ve muhasebe kayıtlarının tutulması",
        "Destek taleplerinin yanıtlanması, sizinle iletişim kurulması ve işlem bildirimlerinin (ödeme, proje aşaması, destek yanıtı) gönderilmesi",
        "Yasal yükümlülüklerin yerine getirilmesi (vergi, tüketici mevzuatı) ve talep halinde yetkili makamlara bilgi verilmesi",
        "Bilgi güvenliğinin sağlanması, dolandırıcılık ve kötüye kullanımın önlenmesi, uyuşmazlıklarda delil olarak saklama",
      ],
    },
    {
      heading: "Hukuki sebepler",
      paragraphs: [
        "Verileriniz, Kanun'un 5. maddesinin ikinci fıkrasındaki şu sebeplere dayanılarak işlenir: sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (c), veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (ç), bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması (e) ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimiz için zorunlu olması (f). Bunların dışında kalan işlemler için açık rızanız aranır.",
      ],
    },
    {
      heading: "Toplama yöntemi",
      paragraphs: [
        "Verileriniz; sitedeki kayıt, sipariş, başlangıç formu, destek ve iletişim formları, panele yüklediğiniz belgeler ve sitemizin kullanımı sırasında otomatik yöntemlerle elektronik ortamda toplanır.",
      ],
    },
    {
      heading: "Verilerin aktarıldığı taraflar",
      paragraphs: ["Verileriniz, hizmetin gerektirdiği ölçüde ve yalnızca aşağıdaki alıcı gruplarına aktarılır:"],
      list: [
        "Ödeme kuruluşu: iyzico (kart tahsilatı ve abonelik yönetimi)",
        "Altyapı ve hizmet sağlayıcılar: barındırma ve dosya depolama (Vercel), veritabanı (Neon), e-posta gönderimi (Resend). Bu sağlayıcıların sunucuları yurt dışında olabilir",
        "Reklam hizmeti alıyorsanız: Google (Google Ads hesabınızın kurulması ve yönetilmesi için gerekli bilgiler)",
        "Mali müşavir ve denetçiler, hukuk danışmanları",
        "Kanunen yetkili kamu kurum ve kuruluşları",
      ],
    },
    {
      heading: "Yurt dışına aktarım",
      paragraphs: [
        "Altyapı sağlayıcılarımızın bir kısmı verileri yurt dışındaki sunucularda işleyebilir. Yurt dışına aktarım, Kanun'un 9. maddesine uygun olarak, ilgili kişinin açık rızasına veya mevzuatta öngörülen güvencelere dayanılarak yapılır. Bu aktarıma ilişkin açık rızanız, siparişteki KVKK onayı ile ayrıca alınır.",
      ],
    },
    {
      heading: "Saklama süresi",
      paragraphs: [
        "Verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen süreler (ör. ticari defter ve fatura kayıtları için on yıl) kadar saklanır. Bu sürelerin sonunda silinir, yok edilir veya anonim hale getirilir. Abonelik sona erdiğinde hesap ve proje verileriniz, yasal saklama yükümlülüğü bulunmayanlar için makul bir süre sonunda silinir.",
      ],
    },
    {
      heading: "Haklarınız",
      paragraphs: ["Kanun'un 11. maddesi uyarınca veri sorumlusuna başvurarak şunları talep edebilirsiniz:"],
      list: [
        "Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme",
        "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
        "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
        "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
        "Kanun'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme ve bunun aktarıldığı üçüncü kişilere bildirilmesini isteme",
        "İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç çıkmasına itiraz etme",
        "Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme",
      ],
    },
    {
      heading: "Başvuru yöntemi",
      paragraphs: [
        `Haklarınıza ilişkin taleplerinizi, kimliğinizi tespit edecek bilgilerle birlikte yazılı olarak ${c.address} adresine${c.kep ? `, ${c.kep} KEP adresine` : ""} veya ${c.email} e-posta adresine iletebilirsiniz. Başvurunuz, talebin niteliğine göre en geç otuz gün içinde ücretsiz olarak sonuçlandırılır; işlemin ayrıca maliyet gerektirmesi halinde Kurul tarafından belirlenen tarifedeki ücret alınabilir.`,
      ],
    },
  ],
};

export const gizlilik: LegalDoc = {
  slug: "gizlilik-ve-cerez",
  title: "Gizlilik ve çerez politikası",
  description: "Sitemizin hangi çerezleri kullandığı ve gizlilik uygulamalarımız.",
  intro: "Bu sayfa, sitemizi ziyaret ettiğinizde hangi bilgilerin toplandığını ve çerezlerin nasıl kullanıldığını açıklar.",
  sections: [
    {
      heading: "Kısaca",
      paragraphs: [
        "Sitemiz reklam, izleme veya profil çıkarma amaçlı çerez kullanmaz. Yalnızca panele giriş yapmanız için gerekli oturum çerezini kullanırız. Bu çerez zorunlu olduğundan onay istenmez.",
      ],
    },
    {
      heading: "Kullandığımız çerezler",
      paragraphs: ["Çerez listesi:"],
      list: [
        "Oturum çerezi (zorunlu): giriş yaptığınızda oluşturulur, panelde kimliğinizi doğrulamak için kullanılır, çıkış yaptığınızda veya süresi dolduğunda silinir.",
        "Üçüncü taraf çerezleri: ödeme sırasında iyzico'nun güvenli ödeme formu, kendi güvenlik ve işlem çerezlerini kullanabilir. Bu çerezler iyzico'nun politikalarına tabidir.",
      ],
    },
    {
      heading: "Analitik ve reklam araçları",
      paragraphs: [
        "Sitemizde şu anda ziyaretçi analitiği veya reklam etiketi kullanılmaz. İleride kullanılırsa bu sayfa güncellenir ve gerekli olan yerde açık rızanız alınır.",
      ],
    },
    {
      heading: "Sunucu kayıtları",
      paragraphs: [
        "Güvenlik ve hata ayıklama amacıyla sunucularımız IP adresi, tarayıcı bilgisi ve istek zamanı gibi teknik kayıtlar tutabilir. Bu kayıtlar sınırlı süre saklanır.",
      ],
    },
    {
      heading: "Çerezleri yönetme",
      paragraphs: [
        "Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu oturum çerezini engellerseniz panele giriş yapamazsınız.",
      ],
    },
    {
      heading: "Kişisel verileriniz",
      paragraphs: ["Kişisel verilerinizin işlenmesine ilişkin ayrıntılar KVKK Aydınlatma Metni'ndedir. Sorularınız için: " + c.email],
    },
  ],
};

export const kullanimKosullari: LegalDoc = {
  slug: "kullanim-kosullari",
  title: "Site kullanım koşulları",
  description: "kasifyazilim.com.tr sitesinin kullanım koşulları.",
  sections: [
    {
      heading: "Genel",
      paragraphs: [
        "Bu siteyi kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Sitenin içeriği bilgilendirme amaçlıdır; abonelik satın alma işlemi ayrıca Mesafeli Hizmet Satış Sözleşmesi'ne tabidir.",
      ],
    },
    {
      heading: "Fikri mülkiyet",
      paragraphs: [
        "Sitedeki metin, tasarım, logo, yazılım ve diğer içeriklerin hakları Kaşif Yazılım'a aittir; yazılı izin olmadan kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.",
      ],
    },
    {
      heading: "Hesap güvenliği",
      paragraphs: [
        "Hesabınızın ve şifrenizin güvenliğinden siz sorumlusunuz. Hesabınızda yetkisiz bir kullanım fark ederseniz bize derhal bildirin.",
      ],
    },
    {
      heading: "Yasaklı kullanım",
      paragraphs: [
        "Siteye zarar verecek, güvenliğini aşmaya çalışacak, otomatik araçlarla aşırı istek gönderecek veya hukuka aykırı içerik yükleyecek kullanım yasaktır. Bu tür kullanım halinde hesap askıya alınabilir ve yasal yollara başvurulabilir.",
      ],
    },
    {
      heading: "Sorumluluk",
      paragraphs: [
        "Siteyi kesintisiz ve hatasız sunmaya özen gösteririz ancak kesinti ve hatasızlık garantisi vermeyiz. Sitedeki bağlantılarla ulaşılan üçüncü taraf sitelerin içeriğinden sorumlu değiliz.",
      ],
    },
    {
      heading: "Değişiklik ve uygulanacak hukuk",
      paragraphs: [
        "Bu koşulları zaman zaman güncelleyebiliriz; güncel hali bu sayfadadır. Koşullara Türk hukuku uygulanır.",
      ],
    },
  ],
};

export const legalDocs: LegalDoc[] = [mesafeliSatis, onBilgilendirme, iptalIade, kvkk, gizlilik, kullanimKosullari];
