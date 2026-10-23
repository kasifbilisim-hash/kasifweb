import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/session";
import { companyPrefix, readStoredFile } from "@/lib/storage";

/** Özel dosyaları yalnızca sahibi (firma) ve yöneticiler indirebilir. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const pathname = request.nextUrl.searchParams.get("p") ?? "";
  const match = /^companies\/([0-9a-f-]{36})\/[\w./-]+$/i.exec(pathname);
  if (!match || pathname.includes("..")) return NextResponse.json({ error: "Geçersiz dosya." }, { status: 400 });

  if (session.user.role !== "admin") {
    const [company] = await db
      .select({ id: schema.companies.id })
      .from(schema.companies)
      .where(eq(schema.companies.userId, session.user.id));
    // Başkasının dosyası ile var olmayan dosya aynı yanıtı verir.
    if (!company || !pathname.startsWith(companyPrefix(company.id))) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
    }
  }

  const file = await readStoredFile(pathname);
  if (!file) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const name = pathname.split("/").pop()!;
  return new NextResponse(file.stream, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
