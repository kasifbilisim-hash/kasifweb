import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = { title: "Taahhütnameler", robots: { index: false } };

export default function TaahhutnamelerPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16">Yükleniyor</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const rows = await db
    .select({ doc: schema.commitmentDocuments, company: schema.companies })
    .from(schema.commitmentDocuments)
    .innerJoin(schema.companies, eq(schema.companies.id, schema.commitmentDocuments.companyId))
    .where(eq(schema.commitmentDocuments.status, "yuklendi"))
    .orderBy(asc(schema.commitmentDocuments.updatedAt));

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display text-4xl text-emaye sm:text-5xl">Taahhütnameler</h1>
      <p className="mt-4 max-w-xl text-soluk">İmzalı nüshası yüklenmiş, onay bekleyenler. Eskiden yeniye sıralı.</p>
      {rows.length === 0 ? (
        <p className="mt-10 text-xl">Bekleyen taahhütname yok.</p>
      ) : (
        <ul className="mt-10 space-y-8">
          {rows.map(({ doc, company }) => (
            <li key={doc.id} className="grid gap-6 border-4 border-murekkep bg-beyaz p-6 md:grid-cols-2">
              <div>
                <h2 className="ui text-xl">
                  <Link href={`/yonetim/musteriler/${company.id}`} className="underline underline-offset-4">{company.legalName}</Link>
                </h2>
                <p className="mt-1 text-soluk">Yüklendi: {formatDateTime(doc.updatedAt)}</p>
                <p className="mt-4 space-x-4">
                  {doc.signedUploadUrl ? (
                    <a href={`/api/dosya?p=${encodeURIComponent(doc.signedUploadUrl)}`} className="underline underline-offset-4">İmzalı nüshayı aç</a>
                  ) : null}
                  {doc.generatedPdfUrl ? (
                    <a href={`/api/dosya?p=${encodeURIComponent(doc.generatedPdfUrl)}`} className="underline underline-offset-4">Üretilen PDF</a>
                  ) : null}
                </p>
                <p className="mt-4 text-soluk">Nüshada kaşe, imza ve unvanın firma bilgileriyle uyuştuğunu kontrol edin.</p>
              </div>
              <ReviewForm docId={doc.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
