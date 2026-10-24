import Link from "next/link";
import { Suspense } from "react";
import { estimateNextPayment } from "@/lib/billing";
import { formatDate } from "@/lib/format";
import { formatTL } from "@/lib/packages";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";

export default function PanelPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

const STAGES: Record<string, string> = {
  bilgi_bekleniyor: "Bilgileriniz bekleniyor",
  taahhutname_bekleniyor: "Taahhütname bekleniyor",
  tasarim: "Tasarım",
  musteri_onayi: "Onayınız bekleniyor",
  gelistirme: "Geliştirme",
  yayinda: "Yayında",
  sonlandirildi: "Sonlandırıldı",
};

const SUB_STATUS: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  active: "Aktif",
  payment_failed: "Ödeme alınamadı",
  cancel_requested: "İptal talebi değerlendiriliyor",
  cancelled: "İptal edildi",
  expired: "Süresi doldu",
};

const COMMITMENT: Record<string, string> = {
  bekliyor: "İndirip imzalayarak yükleyin",
  yuklendi: "Yönetici onayı bekleniyor",
  onaylandi: "Onaylandı",
  reddedildi: "Kabul edilmedi, yeniden yükleyin",
};

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);

  if (!data?.subscription) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Panel</h1>
        <p className="mt-6 max-w-xl text-xl">
          Henüz aboneliğiniz yok.{" "}
          <Link href="/paketler" className="underline underline-offset-4">
            Paketlere göz atın
          </Link>
          .
        </p>
      </section>
    );
  }

  const { subscription: sub } = data;
  const nextPayment =
    sub.status === "active"
      ? estimateNextPayment({
          startedAt: sub.startedAt,
          commitmentEndsAt: sub.commitmentEndsAt,
          successfulPayments: data.payments.filter((p) => p.status === "success").length,
        })
      : null;

  const todo = [
    {
      href: "/panel/taahhutname",
      title: "Taahhütname",
      status: data.commitment ? COMMITMENT[data.commitment.status] : "-",
      done: data.commitment?.status === "onaylandi",
    },
    {
      href: "/panel/baslangic",
      title: "Başlangıç formu",
      status:
        data.onboarding?.status === "gonderildi"
          ? "Gönderildi"
          : data.onboarding
            ? "Taslak kayıtlı, devam edin"
            : "Henüz başlanmadı",
      done: data.onboarding?.status === "gonderildi",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Panel</h1>
      {sub.status === "payment_failed" && (
        <p role="alert" className="mt-8 max-w-2xl border-4 border-red-800 p-5">
          Son ödemeniz alınamadı. Kartınızı güncelleyin, çekim yeniden denenir.{" "}
          <Link href="/panel/odemeler" className="underline underline-offset-4">
            Ödemeler
          </Link>
        </p>
      )}
      {sub.status === "cancel_requested" && (
        <p role="status" className="levha mt-8 max-w-2xl bg-tabela p-5">
          İptal talebiniz ekibimize iletildi. Onaylanana kadar hizmetiniz ve aylık çekim sürer. Alan adınız sizde kalır.
        </p>
      )}
      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="ui">Paket</dt>
          <dd>{data.package?.name}</dd>
        </div>
        <div>
          <dt className="ui">Proje aşaması</dt>
          <dd>{data.project ? STAGES[data.project.stage] : "-"}</dd>
        </div>
        <div>
          <dt className="ui">Abonelik</dt>
          <dd>{SUB_STATUS[sub.status]}</dd>
        </div>
        <div>
          <dt className="ui">Aylık bedel</dt>
          <dd>{data.package?.monthlyPriceKurus != null ? `${formatTL(data.package.monthlyPriceKurus)} / ay` : "-"}</dd>
        </div>
        <div>
          <dt className="ui">Sonraki ödeme (tahmini)</dt>
          <dd>{nextPayment ? formatDate(nextPayment) : "-"}</dd>
        </div>
        <div>
          <dt className="ui">Taahhüt bitişi</dt>
          <dd>{sub.commitmentEndsAt ? formatDate(sub.commitmentEndsAt) : "-"}</dd>
        </div>
      </dl>

      <h2 className="ui mt-12 text-2xl">Yapılacaklar</h2>
      <ul className="mt-4 divide-y-2 divide-murekkep border-y-2 border-murekkep">
        {todo.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="flex flex-wrap items-baseline justify-between gap-2 py-4 hover:bg-beyaz">
              <span className="ui text-xl">{t.title}</span>
              <span className={t.done ? "text-emaye" : ""}>{t.status}</span>
            </Link>
          </li>
        ))}
      </ul>

      {sub.status === "active" || sub.status === "payment_failed" ? (
        <p className="mt-10 text-soluk">
          Memnun kalmadınız mı?{" "}
          <Link href="/panel/iptal" className="underline underline-offset-4">İptal talebi açın</Link>.
        </p>
      ) : null}
    </section>
  );
}
