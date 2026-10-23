import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Hızlı ilk kapı: oturum çerezi yoksa korumalı alana hiç girmez. Çerezin geçerliliği ve
// rol kontrolü burada YAPILMAZ; onlar layout guard'ında ve veri okuyan her sayfada (requireUser,
// requireAdmin) yapılır.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/giris", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/yonetim/:path*"],
};
