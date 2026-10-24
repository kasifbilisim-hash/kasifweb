import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { formatDate } from "@/lib/format";
import { formatTL } from "@/lib/packages";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";
import { CardUpdate } from "./card-update";

export const metadata: Metadata = { title: "Ödemeler", robots: { index: false } };

const STATUS: Record<string, string> = {
  success: "Ödendi",
  failed: "Alınamadı",
  pending: "Bekliyor",
  refunded: "İade edildi",
};

export default function OdemelerPage({ searchParams }: { searchParams: Promise<{ kart?: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: Promise<{ kart?: string }> }) {
  const { kart } = await searchParams;
  const user = await requireUser();
  const data = await getPanelData(user.id);

  if (!data?.subscription) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Ödemeler</h1>
        <p className="mt-6 max-w-xl text-xl">
          Henüz aboneliğiniz yok.{" "}
          <Link href="/paketler" className="underline underline-offset-4">Paketlere göz atın</Link>.
        </p>
      </section>
    );
  }

  const { subscription: sub, payments } = data;
  const canChangeCard = sub.status === "active" || sub.status === "payment_failed";

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Ödemeler</h1>

      {sub.status === "payment_failed" && (
        <p role="alert" className="mt-8 max-w-2xl border-4 border-red-800 p-5">
          Son ödemeniz alınamadı. Kartınızı güncelleyin, çekim yeniden denenir.
        </p>
      )}
      {kart === "donuldu" && (
        <p role="status" className="mt-8 max-w-2xl border-2 border-murekkep p-5">
          Kart güncelleme formundan döndünüz. İşlem tamamlandıysa bir sonraki çekimde yeni kartınız kullanılır.
        </p>
      )}

      <div className="mt-10">
        {payments.length === 0 ? (
          <p className="max-w-xl text-xl">Henüz ödeme kaydı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-y-2 border-murekkep text-left">
              <caption className="sr-only">Ödeme geçmişi</caption>
              <thead>
                <tr className="border-b-2 border-murekkep">
                  <th scope="col" className="ui py-3 pr-4">Tarih</th>
                  <th scope="col" className="ui py-3 pr-4">Tutar</th>
                  <th scope="col" className="ui py-3 pr-4">Durum</th>
                  <th scope="col" className="ui py-3">Fatura</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-murekkep">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">{formatDate(p.paidAt ?? p.createdAt)}</td>
                    <td className="py-3 pr-4">{formatTL(p.amountKurus)}</td>
                    <td className={`py-3 pr-4 ${p.status === "failed" ? "text-red-800" : ""}`}>{STATUS[p.status]}</td>
                    <td className="py-3">
                      {p.invoiceUrl ? (
                        <a href={`/api/dosya?p=${encodeURIComponent(p.invoiceUrl)}`} className="underline underline-offset-4">
                          İndir
                        </a>
                      ) : (
                        <span className="text-soluk">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 max-w-2xl text-soluk">
          Tutar yalnızca hizmet bedelidir. Google Ads harcaması kartınızdan doğrudan Google&apos;a ödenir ve burada görünmez.
        </p>
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="ui text-2xl">Kart</h2>
          <p className="mt-2 mb-4 max-w-md text-soluk">Aylık çekimler kayıtlı kartınızdan yapılır. Kartı iyzico&apos;nun güvenli formunda değiştirirsiniz.</p>
          {canChangeCard ? <CardUpdate /> : <p>Bu abonelik durumunda kart değiştirilemez.</p>}
        </div>
        <div>
          <h2 className="ui text-2xl">Abonelik</h2>
          <p className="mt-2 mb-4 max-w-md text-soluk">12 aylık taahhüdünüz içinde memnun kalmazsanız iptal talebi açabilirsiniz.</p>
          <Link href="/panel/iptal" className="ui inline-block border-2 border-murekkep px-6 py-3">
            Aboneliği iptal et
          </Link>
        </div>
      </div>
    </section>
  );
}
