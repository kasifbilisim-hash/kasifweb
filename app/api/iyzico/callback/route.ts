import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { activateFromCheckout } from "@/lib/subscriptions";

const tokenSchema = z.string().min(8).max(200);

function resultUrl(request: NextRequest, status: "basarili" | "basarisiz") {
  return new URL(`/panel/abonelik/sonuc?durum=${status}`, request.nextUrl.origin);
}

// iyzico, ödeme sonrası tarayıcıyı bu adrese POST ile döndürür (dokümanda alan adları belirtilmemiş,
// bu yüzden token hem form gövdesinden hem sorgudan okunur). Oturum çerezi cross-site POST ile
// gelmeyebilir; bu yüzden oturuma değil, abonelikle eşleşen token'a ve iyzico'nun sorgu sonucuna güveniriz.
async function handle(request: NextRequest) {
  let raw: unknown = request.nextUrl.searchParams.get("token");
  if (!raw && request.method === "POST") {
    const form = await request.formData().catch(() => null);
    raw = form?.get("token");
  }
  const token = tokenSchema.safeParse(raw);
  if (!token.success) return NextResponse.redirect(resultUrl(request, "basarisiz"), 303);

  const result = await activateFromCheckout(token.data);
  return NextResponse.redirect(resultUrl(request, result.ok ? "basarili" : "basarisiz"), 303);
}

export const POST = handle;
export const GET = handle;
