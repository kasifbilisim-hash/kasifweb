import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { AGREEMENTS } from "@/lib/legal";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Firma ve belgeler", robots: { index: false } };

const COMMITMENT: Record<string, string> = {
  bekliyor: "İndirip imzalayarak yükleyin",
  yuklendi: "Yönetici onayı bekleniyor",
  onaylandi: "Onaylandı",
  reddedildi: "Kabul edilmedi, yeniden yükleyin",
};

export default function FirmaPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser();
  const data = await getPanelData(user.id);

  if (!data) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="display text-4xl text-emaye sm:text-5xl">Firma ve belgeler</h1>
        <p className="mt-6 max-w-xl text-xl">
          Firma bilgileriniz abone olurken kaydedilir.{" "}
          <Link href="/paketler" className="underline underline-offset-4">Paketlere göz atın</Link>.
        </p>
      </section>
    );
  }

  const { company, commitment } = data;
  const acceptances = await db
    .select()
    .from(schema.agreementAcceptances)
    .where(eq(schema.agreementAcceptances.userId, user.id))
    .orderBy(desc(schema.agreementAcceptances.createdAt));

  const rows: [string, string][] = [
    ["Unvan", company.legalName],
    ["Vergi dairesi", company.taxOffice],
    ["Vergi no", company.taxNumber],
    ["Adres", `${company.address}, ${company.city}`],
    ["Yetkili", company.contactName],
    ["Telefon", company.contactPhone],
  ];

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-2">
      <div>
        <h1 className="display text-4xl text-emaye sm:text-5xl">Firma ve belgeler</h1>
        <dl className="mt-8 space-y-4">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="ui">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-md text-soluk">
          Bilgiler fatura ve taahhütnamede kullanılır. Değişiklik için{" "}
          <Link href="/panel/destek/yeni" className="underline underline-offset-4">destek talebi</Link> açın.
        </p>
      </div>

      <div className="space-y-10">
        <div>
          <h2 className="ui text-2xl">Taahhütname</h2>
          {commitment ? (
            <p className="mt-3">
              {COMMITMENT[commitment.status]}.{" "}
              <Link href="/panel/taahhutname" className="underline underline-offset-4">Taahhütname sayfası</Link>
              {commitment.signedUploadUrl ? (
                <>
                  {" · "}
                  <a href={`/api/dosya?p=${encodeURIComponent(commitment.signedUploadUrl)}`} className="underline underline-offset-4">
                    İmzalı nüsha
                  </a>
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-3 text-soluk">Taahhütname abonelikten sonra açılır.</p>
          )}
        </div>

        <div>
          <h2 className="ui text-2xl">Onayladığınız sözleşmeler</h2>
          {acceptances.length === 0 ? (
            <p className="mt-3 text-soluk">Kayıt yok.</p>
          ) : (
            <ul className="mt-3 divide-y-2 divide-murekkep border-y-2 border-murekkep">
              {acceptances.map((a) => {
                const doc = AGREEMENTS.find((x) => x.type === a.documentType);
                return (
                  <li key={a.id} className="py-3">
                    {doc ? (
                      <Link href={doc.href} className="underline underline-offset-4">{doc.title}</Link>
                    ) : (
                      a.documentType
                    )}
                    <span className="block text-soluk">Sürüm {a.documentVersion} · {formatDateTime(a.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
