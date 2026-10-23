import { STAGE_LABEL } from "@/lib/labels";

export type EmailContent = {
  subject: string;
  heading: string;
  paragraphs: string[];
  cta?: { label: string; path: string };
};

export type TemplateContext = {
  company?: string;
  data?: Record<string, unknown>;
};

type Builder = (ctx: TemplateContext) => EmailContent;

const str = (v: unknown) => (typeof v === "string" ? v : "");

const customer: Record<string, Builder> = {
  welcome: () => ({
    subject: "Aboneliğiniz başladı",
    heading: "Aboneliğiniz başladı",
    paragraphs: [
      "Ödemeniz alındı. Sıradaki adım taahhütnameyi indirip kaşe ve imzayla yüklemek, ardından başlangıç formunu doldurmak.",
      "Taahhütname onaylanmadan tasarım aşamasına geçmiyoruz.",
    ],
    cta: { label: "Panele git", path: "/panel" },
  }),
  payment_received: () => ({
    subject: "Aylık ödemeniz alındı",
    heading: "Ödemeniz alındı",
    paragraphs: ["Aylık hizmet bedeli kartınızdan çekildi. Faturanız hazır olunca panelden indirebilirsiniz."],
    cta: { label: "Ödemelerim", path: "/panel/odemeler" },
  }),
  payment_failed: () => ({
    subject: "Aylık ödemeniz alınamadı",
    heading: "Ödemeniz alınamadı",
    paragraphs: ["Bu ayki hizmet bedeli kartınızdan çekilemedi. Kartınızı güncellerseniz çekim yeniden denenir."],
    cta: { label: "Kartı güncelle", path: "/panel/odemeler" },
  }),
  commitment_approved: () => ({
    subject: "Taahhütnameniz onaylandı",
    heading: "Taahhütnameniz onaylandı",
    paragraphs: ["İmzalı nüshanız onaylandı. Başlangıç formunuz da bize ulaştıysa projeniz tasarım aşamasına geçer."],
    cta: { label: "Projem", path: "/panel/proje" },
  }),
  commitment_rejected: ({ data }) => ({
    subject: "Taahhütnameniz kabul edilmedi",
    heading: "Taahhütnameniz kabul edilmedi",
    paragraphs: [`Neden: ${str(data?.reason) || "[Neden belirtilmedi]"}`, "Düzeltilmiş nüshayı panelden yeniden yükleyebilirsiniz."],
    cta: { label: "Taahhütname sayfası", path: "/panel/taahhutname" },
  }),
  project_stage_changed: ({ data }) => {
    const stage = STAGE_LABEL[str(data?.stage)] ?? "yeni aşama";
    return {
      subject: `Projeniz: ${stage}`,
      heading: `Projeniz ${stage} aşamasında`,
      paragraphs: ["Ayrıntıları ve geçmişi panelden görebilirsiniz."],
      cta: { label: "Projem", path: "/panel/proje" },
    };
  },
  ticket_reply: () => ({
    subject: "Destek talebinize yanıt verdik",
    heading: "Destek talebinize yanıt var",
    paragraphs: ["Ekibimiz talebinizi yanıtladı. Yanıtı panelden okuyabilir, devam etmek için yazabilirsiniz."],
    cta: { label: "Taleplerim", path: "/panel/destek" },
  }),
  cancel_approved: () => ({
    subject: "İptal talebiniz onaylandı",
    heading: "Aboneliğiniz iptal edildi",
    paragraphs: ["İptal talebiniz onaylandı, aylık çekim durdu ve hizmetlerimiz sona erdi. Alan adınız sizde kalır."],
  }),
  cancel_rejected: ({ data }) => ({
    subject: "İptal talebiniz hakkında",
    heading: "İptal talebiniz kabul edilmedi",
    paragraphs: [`Neden: ${str(data?.reason) || "[Neden belirtilmedi]"}`, "Aboneliğiniz devam ediyor. Sorularınız için destek talebi açabilirsiniz."],
    cta: { label: "Destek", path: "/panel/destek" },
  }),
  invoice_ready: () => ({
    subject: "Faturanız hazır",
    heading: "Faturanız hazır",
    paragraphs: ["Faturanızı panelden indirebilirsiniz."],
    cta: { label: "Ödemelerim", path: "/panel/odemeler" },
  }),
};

const admin: Record<string, Builder> = {
  onboarding_submitted: ({ company }) => ({
    subject: `Başlangıç formu geldi: ${company ?? ""}`,
    heading: "Başlangıç formu gönderildi",
    paragraphs: [`${company ?? "Bir müşteri"} başlangıç formunu gönderdi.`],
    cta: { label: "Müşteriler", path: "/yonetim/musteriler" },
  }),
  commitment_uploaded: ({ company }) => ({
    subject: `Taahhütname onay bekliyor: ${company ?? ""}`,
    heading: "İmzalı taahhütname yüklendi",
    paragraphs: [`${company ?? "Bir müşteri"} imzalı nüshayı yükledi, onayınızı bekliyor.`],
    cta: { label: "Taahhütnameler", path: "/yonetim/taahhutnameler" },
  }),
  ticket_created: ({ company }) => ({
    subject: `Yeni destek talebi: ${company ?? ""}`,
    heading: "Yeni destek talebi",
    paragraphs: [`${company ?? "Bir müşteri"} yeni talep açtı.`],
    cta: { label: "Destek talepleri", path: "/yonetim/destek" },
  }),
  ticket_reply: ({ company }) => ({
    subject: `Talebe yanıt geldi: ${company ?? ""}`,
    heading: "Müşteri yanıt yazdı",
    paragraphs: [`${company ?? "Bir müşteri"} destek talebine yeni mesaj yazdı.`],
    cta: { label: "Destek talepleri", path: "/yonetim/destek" },
  }),
  cancel_requested: ({ company }) => ({
    subject: `İptal talebi: ${company ?? ""}`,
    heading: "Yeni iptal talebi",
    paragraphs: [`${company ?? "Bir müşteri"} iptal talebi açtı. Hizmet ve aylık çekim siz karar verene kadar sürer.`],
    cta: { label: "İptal talepleri", path: "/yonetim/iptal" },
  }),
  preview_approved: ({ company }) => ({
    subject: `Tasarım onaylandı: ${company ?? ""}`,
    heading: "Müşteri tasarımı onayladı",
    paragraphs: [`${company ?? "Bir müşteri"} önizlemeyi onayladı, proje geliştirmeye geçti.`],
    cta: { label: "Müşteriler", path: "/yonetim/musteriler" },
  }),
  revision_requested: ({ company }) => ({
    subject: `Revizyon istendi: ${company ?? ""}`,
    heading: "Müşteri revizyon istedi",
    paragraphs: [`${company ?? "Bir müşteri"} revizyon istedi, proje tasarım aşamasına döndü. Notu müşteri sayfasındaki geçmişte bulursunuz.`],
    cta: { label: "Müşteriler", path: "/yonetim/musteriler" },
  }),
  payment_failed: ({ company }) => ({
    subject: `Ödeme alınamadı: ${company ?? ""}`,
    heading: "Bir aboneliğin ödemesi alınamadı",
    paragraphs: [`${company ?? "Bir müşteri"} için aylık çekim başarısız oldu.`],
    cta: { label: "Müşteriler", path: "/yonetim/musteriler" },
  }),
};

/** Bilinen bir şablon yoksa null döner (çağıran loglayıp geçer). */
export function buildEmail(to: "customer" | "admin", template: string, ctx: TemplateContext): EmailContent | null {
  const b = (to === "customer" ? customer : admin)[template];
  return b ? b(ctx) : null;
}
