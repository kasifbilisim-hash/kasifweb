import { timingSafeEqual } from "node:crypto";
import { and, count, inArray, lt } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { isIyzicoConfigured } from "@/lib/iyzico/client";
import { notifyAdminRaw } from "@/lib/notify";
import { purgeExpiredRateLimits } from "@/lib/rate-limit";
import { syncSubscription } from "@/lib/subscriptions";

/**
 * Günlük iş (vercel.json). Vercel, CRON_SECRET tanımlıysa isteğe "Authorization: Bearer <secret>" ekler.
 *  1) Webhook'u kaçırılmış olabilecek abonelikleri iyzico'dan sorgular ve eşler.
 *  2) 3 günden uzun süredir yanıtsız destek talepleri için yöneticiye tek özet e-postası gönderir.
 */
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const result = { synced: 0, updated: 0, failed: 0, iyzico: isIyzicoConfigured(), staleTickets: 0, purgedRateLimits: 0 };
  result.purgedRateLimits = await purgeExpiredRateLimits().catch((err) => {
    console.error("[cron] hız sınırı temizliği başarısız", err);
    return 0;
  });

  if (result.iyzico) {
    const subs = await db
      .select({ id: schema.subscriptions.id })
      .from(schema.subscriptions)
      .where(inArray(schema.subscriptions.status, ["active", "payment_failed", "cancel_requested"]));
    for (const s of subs) {
      try {
        const r = await syncSubscription(s.id);
        if (r !== "skipped") result.synced++;
        if (r === "updated") result.updated++;
      } catch (err) {
        // Bir aboneliğin hatası diğerlerini durdurmaz.
        result.failed++;
        console.error("[cron] abonelik eşlenemedi", s.id, err);
      }
    }
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
  const [stale] = await db
    .select({ n: count() })
    .from(schema.tickets)
    .where(and(inArray(schema.tickets.status, ["acik", "yanit_bekliyor"]), lt(schema.tickets.updatedAt, threeDaysAgo)));
  result.staleTickets = stale?.n ?? 0;
  if (result.staleTickets > 0) {
    await notifyAdminRaw({
      subject: `${result.staleTickets} talep 3 günü aştı`,
      heading: "Yanıt bekleyen talepler",
      paragraphs: [`${result.staleTickets} destek talebi 3 günden uzun süredir yanıtsız.`],
      cta: { label: "Destek talepleri", path: "/yonetim/destek" },
    });
  }

  return NextResponse.json(result);
}
