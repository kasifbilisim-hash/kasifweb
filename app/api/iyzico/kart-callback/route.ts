import { NextResponse, type NextRequest } from "next/server";

// iyzico kart güncelleme formundan sonra tarayıcıyı buraya POST ile döndürür. Veritabanında değişecek bir
// şey yok (kart iyzico'da tutulur, sonraki çekimde yeni kart kullanılır); yalnızca panele geri yönlendiririz.
function back(request: NextRequest) {
  return NextResponse.redirect(new URL("/panel/odemeler?kart=donuldu", request.nextUrl.origin), 303);
}

export const POST = back;
export const GET = back;
