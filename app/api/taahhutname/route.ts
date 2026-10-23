import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { generateCommitmentPdf } from "@/lib/commitment-pdf";
import { db, schema } from "@/lib/db";
import { COMMITMENT_MONTHS } from "@/lib/legal";
import { formatTL } from "@/lib/packages";
import { getPanelData } from "@/lib/panel-data";
import { rateLimit, tooManyMessage } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { companyLine } from "@/lib/site";
import { companyPrefix, readStoredFile, saveFile } from "@/lib/storage";

function pdfResponse(bytes: BodyInit, size: number) {
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(size),
      "Content-Disposition": 'attachment; filename="taahhutname.pdf"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Durum değiştirir (PDF üretir ve kaydeder): GET değil POST. Çerez SameSite=Lax olduğundan başka sitenin
// form gönderimi oturumla gelmez.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const limited = await rateLimit(`pdf:${session.user.id}`, 30, 3600);
  if (!limited.ok) return NextResponse.json({ error: tooManyMessage(limited) }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } });

  const data = await getPanelData(session.user.id);
  if (!data?.subscription || !data.package || !data.commitment) {
    return NextResponse.json({ error: "Aktif aboneliğiniz yok." }, { status: 404 });
  }
  const { company, commitment } = data;

  // Taahhütname yüklendikten ya da onaylandıktan sonra aynı belge sunulur; fiyat/bilgi değişse bile
  // müşterinin imzaladığı metin değişmez.
  const frozen = commitment.status === "yuklendi" || commitment.status === "onaylandi";
  if (frozen && commitment.generatedPdfUrl) {
    const stored = await readStoredFile(commitment.generatedPdfUrl);
    if (stored) return pdfResponse(stored.stream, stored.size);
  }

  const bytes = await generateCommitmentPdf(
    {
      legal_name: company.legalName,
      tax_office: company.taxOffice,
      tax_number: company.taxNumber,
      address: company.address,
      city: company.city,
      contact_name: company.contactName,
      package_name: data.package.name,
      monthly_price: formatTL(data.package.monthlyPriceKurus),
      commitment_months: String(COMMITMENT_MONTHS),
      provider_details: companyLine,
    },
    new Date(),
  );

  const pathname = `${companyPrefix(company.id)}taahhutname/uretilen.pdf`;
  await saveFile(pathname, bytes, "application/pdf");
  await db
    .update(schema.commitmentDocuments)
    .set({ generatedPdfUrl: pathname })
    .where(eq(schema.commitmentDocuments.id, commitment.id));
  await writeAudit({
    actorUserId: session.user.id,
    action: "commitment.generated",
    targetTable: "commitment_documents",
    targetId: commitment.id,
  });

  return pdfResponse(Buffer.from(bytes), bytes.byteLength);
}
