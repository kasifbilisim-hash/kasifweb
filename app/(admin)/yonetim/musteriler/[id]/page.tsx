import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, inArray, or } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { COMMITMENT_LABEL, PAYMENT_STATUS, STAGE_LABEL, SUB_STATUS } from "@/lib/labels";
import { formatTL } from "@/lib/packages";
import { requireAdmin } from "@/lib/session";
import type { OnboardingData } from "@/lib/validation/onboarding";
import { ReviewForm } from "../../taahhutnameler/review-form";
import { InvoiceForm, StageForm } from "./forms";

export const metadata: Metadata = { title: "Müşteri", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default function MusteriPage({ params }: PageProps<"/yonetim/musteriler/[id]">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content params={params} />
    </Suspense>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="ui border-t-4 border-murekkep pt-4 text-2xl">{children}</h2>;
}

const fileLink = (path: string, label: string) => (
  <a key={path} href={`/api/dosya?p=${encodeURIComponent(path)}`} className="underline underline-offset-4">{label}</a>
);

const YESNO: Record<string, string> = { evet: "Evet", hayir: "Hayır", ben: "Müşteri gönderecek", siz: "Biz yazacağız", firma: "Firma adına", baska: "Başka biri adına", bilmiyorum: "Bilmiyor", var: "Var", yok: "Yok" };
const GOALS: Record<string, string> = { arama: "Telefonla arama", form: "Form doldurma", whatsapp: "WhatsApp mesajı" };

function OnboardingSummary({ data }: { data: OnboardingData }) {
  const rows: [string, React.ReactNode][] = [
    ["Sektör", data.firma.sector],
    ["Hizmet / ürünler", data.firma.offering],
    ["Hedef bölge", data.firma.region],
    ["Rakipler", data.firma.competitors],
    ["Tanıtım", data.firma.intro],
    ["Marka renkleri", data.marka.colors],
    ["Beğendiği siteler", data.marka.likedSites],
    ["Logo", data.marka.logo ? fileLink(data.marka.logo.path, data.marka.logo.name) : ""],
    ["Sayfalar", data.icerik.pages],
    ["Metinler", data.icerik.copyMode ? YESNO[data.icerik.copyMode] : ""],
    ["Gönderilen metin", data.icerik.contentText],
    ["Fotoğraflar", data.icerik.photos.length ? <span className="space-x-3">{data.icerik.photos.map((p) => fileLink(p.path, p.name))}</span> : ""],
    ["Alan adı var mı", data.alanAdi.hasDomain ? YESNO[data.alanAdi.hasDomain] : ""],
    ["Alan adı", data.alanAdi.domainName],
    ["Kayıtlı olduğu", data.alanAdi.registeredTo ? YESNO[data.alanAdi.registeredTo] : ""],
    ["DNS erişimi", data.alanAdi.dnsAccess ? YESNO[data.alanAdi.dnsAccess] : ""],
    ["Ads hesabı var mı", data.reklam.hasAccount ? YESNO[data.reklam.hasAccount] : ""],
    ["Hedef aylık bütçe", data.reklam.monthlyBudgetKurus ? formatTL(data.reklam.monthlyBudgetKurus) : ""],
    ["Hedef işlemler", data.reklam.goals.map((g) => GOALS[g]).join(", ")],
    ["Reklam bölgesi", data.reklam.regions],
  ];
  const filled = rows.filter(([, v]) => v !== "");
  if (filled.length === 0) return <p className="text-soluk">Form boş.</p>;
  return (
    <dl className="space-y-3">
      {filled.map(([k, v]) => (
        <div key={k}>
          <dt className="ui">{k}</dt>
          <dd className="whitespace-pre-wrap">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  if (!UUID.test(id)) notFound();

  const [row] = await db
    .select({ company: schema.companies, user: schema.user })
    .from(schema.companies)
    .innerJoin(schema.user, eq(schema.user.id, schema.companies.userId))
    .where(eq(schema.companies.id, id));
  if (!row) notFound();
  const { company, user } = row;

  const subs = await db
    .select({ sub: schema.subscriptions, pkg: schema.packages.name })
    .from(schema.subscriptions)
    .innerJoin(schema.packages, eq(schema.packages.id, schema.subscriptions.packageId))
    .where(eq(schema.subscriptions.companyId, company.id))
    .orderBy(desc(schema.subscriptions.createdAt));
  const subIds = subs.map((s) => s.sub.id);

  const [payments, [project], [commitment], [onboarding], tickets, acceptances] = await Promise.all([
    subIds.length
      ? db.select().from(schema.payments).where(inArray(schema.payments.subscriptionId, subIds)).orderBy(desc(schema.payments.createdAt))
      : Promise.resolve([]),
    db.select().from(schema.projects).where(eq(schema.projects.companyId, company.id)).orderBy(desc(schema.projects.createdAt)).limit(1),
    db.select().from(schema.commitmentDocuments).where(eq(schema.commitmentDocuments.companyId, company.id)).orderBy(desc(schema.commitmentDocuments.createdAt)).limit(1),
    db.select().from(schema.onboardingForms).where(eq(schema.onboardingForms.companyId, company.id)),
    db.select().from(schema.tickets).where(eq(schema.tickets.companyId, company.id)).orderBy(desc(schema.tickets.updatedAt)),
    db.select().from(schema.agreementAcceptances).where(eq(schema.agreementAcceptances.userId, user.id)).orderBy(desc(schema.agreementAcceptances.createdAt)),
  ]);

  const targetIds = [company.id, project?.id, commitment?.id, ...subIds, ...payments.map((p) => p.id), ...tickets.map((t) => t.id)].filter((x): x is string => Boolean(x));
  const audit = await db
    .select({ log: schema.auditLog, email: schema.user.email })
    .from(schema.auditLog)
    .leftJoin(schema.user, eq(schema.user.id, schema.auditLog.actorUserId))
    .where(or(inArray(schema.auditLog.targetId, targetIds), eq(schema.auditLog.actorUserId, user.id)))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(50);

  return (
    <section className="mx-auto max-w-6xl space-y-12 px-5 py-14">
      <div>
        <p><Link href="/yonetim/musteriler" className="underline underline-offset-4">Müşteriler</Link></p>
        <h1 className="display mt-4 text-3xl text-emaye sm:text-5xl">{company.legalName}</h1>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <H2>Firma</H2>
          <dl className="space-y-3">
            {[
              ["Yetkili", company.contactName],
              ["E-posta", user.email],
              ["Telefon", company.contactPhone],
              ["Vergi dairesi / no", `${company.taxOffice} / ${company.taxNumber}`],
              ["Adres", `${company.address}, ${company.city}`],
              ["Kayıt", formatDate(company.createdAt)],
            ].map(([k, v]) => (
              <div key={k}><dt className="ui">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <H2>Abonelik</H2>
          {subs.length === 0 ? <p className="text-soluk">Abonelik yok.</p> : (
            <ul className="space-y-4">
              {subs.map(({ sub, pkg }) => (
                <li key={sub.id} className="border-2 border-murekkep p-4">
                  <p className="ui">{pkg}</p>
                  <p className={sub.status === "payment_failed" ? "text-red-800" : ""}>{SUB_STATUS[sub.status]}</p>
                  <p className="text-soluk">
                    {sub.startedAt ? `Başlangıç ${formatDate(sub.startedAt)}` : "Başlamadı"}
                    {sub.commitmentEndsAt ? ` · taahhüt ${formatDate(sub.commitmentEndsAt)} tarihine kadar` : ""}
                    {sub.cancelledAt ? ` · iptal ${formatDate(sub.cancelledAt)}` : ""}
                  </p>
                  {sub.status === "cancel_requested" ? (
                    <p className="mt-2"><Link href="/yonetim/iptal" className="underline underline-offset-4">İptal talebini değerlendir</Link></p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <H2>Ödemeler ve faturalar</H2>
        {payments.length === 0 ? <p className="text-soluk">Ödeme kaydı yok.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-y-2 border-murekkep text-left">
              <caption className="sr-only">Ödemeler</caption>
              <thead>
                <tr className="border-b-2 border-murekkep">
                  <th scope="col" className="ui py-3 pr-4">Tarih</th>
                  <th scope="col" className="ui py-3 pr-4">Tutar</th>
                  <th scope="col" className="ui py-3 pr-4">Durum</th>
                  <th scope="col" className="ui py-3">Fatura PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-murekkep align-top">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">{formatDate(p.paidAt ?? p.createdAt)}</td>
                    <td className="py-3 pr-4">{formatTL(p.amountKurus)}</td>
                    <td className={`py-3 pr-4 ${p.status === "failed" ? "text-red-800" : ""}`}>{PAYMENT_STATUS[p.status]}</td>
                    <td className="py-3">
                      {p.invoiceUrl ? <p className="mb-2">{fileLink(p.invoiceUrl, "Yüklü fatura")}</p> : null}
                      {p.status === "success" ? <InvoiceForm paymentId={p.id} /> : <span className="text-soluk">Yalnızca ödenen kayda</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <H2>Proje</H2>
          {project ? (
            <>
              <p>Şu an: <strong>{STAGE_LABEL[project.stage]}</strong></p>
              {project.stage === "sonlandirildi" ? <p className="text-soluk">Proje sonlandırıldı.</p> : (
                <StageForm companyId={company.id} stage={project.stage} notes={project.notes ?? ""} previewUrl={project.previewUrl ?? ""} />
              )}
            </>
          ) : <p className="text-soluk">Proje, abonelik başlayınca açılır.</p>}
        </div>

        <div className="space-y-4">
          <H2>Taahhütname</H2>
          {commitment ? (
            <>
              <p>{COMMITMENT_LABEL[commitment.status]}</p>
              {commitment.status === "reddedildi" && commitment.rejectionReason ? <p className="text-soluk">Red nedeni: {commitment.rejectionReason}</p> : null}
              <p className="space-x-4">
                {commitment.signedUploadUrl ? fileLink(commitment.signedUploadUrl, "İmzalı nüsha") : null}
                {commitment.generatedPdfUrl ? fileLink(commitment.generatedPdfUrl, "Üretilen PDF") : null}
              </p>
              {commitment.status === "yuklendi" ? <ReviewForm docId={commitment.id} /> : null}
            </>
          ) : <p className="text-soluk">Henüz oluşmadı.</p>}
        </div>
      </div>

      <div className="space-y-4">
        <H2>Başlangıç formu {onboarding ? `(${onboarding.status === "gonderildi" ? "gönderildi" : "taslak"})` : ""}</H2>
        {onboarding ? <OnboardingSummary data={onboarding.data as OnboardingData} /> : <p className="text-soluk">Başlanmadı.</p>}
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <H2>Destek talepleri</H2>
          {tickets.length === 0 ? <p className="text-soluk">Talep yok.</p> : (
            <ul className="divide-y-2 divide-murekkep border-y-2 border-murekkep">
              {tickets.map((t) => (
                <li key={t.id} className="py-3">
                  <Link href={`/yonetim/destek/${t.id}`} className="underline underline-offset-4">{t.subject}</Link>
                  <span className="block text-soluk">{t.status} · {formatDate(t.updatedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <H2>Onaylanan sözleşmeler</H2>
          {acceptances.length === 0 ? <p className="text-soluk">Kayıt yok.</p> : (
            <ul className="divide-y-2 divide-murekkep border-y-2 border-murekkep">
              {acceptances.map((a) => (
                <li key={a.id} className="py-3">
                  {a.documentType} <span className="text-soluk">· sürüm {a.documentVersion} · {formatDateTime(a.createdAt)} · IP {a.ip ?? "-"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <H2>Denetim kaydı</H2>
        {audit.length === 0 ? <p className="text-soluk">Kayıt yok.</p> : (
          <ul className="divide-y-2 divide-murekkep border-y-2 border-murekkep">
            {audit.map(({ log, email }) => (
              <li key={log.id} className="py-3">
                <span className="text-soluk">{formatDateTime(log.createdAt)} · {email ?? "Sistem"}</span>
                <span className="block">{log.action}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
