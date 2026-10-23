import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Sabit pencereli hız sınırı. Tek bir atomik SQL ile sayar (sunucusuz ortamda örnekler arasında
 * paylaşılır). Veritabanına ulaşılamazsa isteği engellemez (fail-open) ve loglar:
 * hız sınırı arızası müşteriyi kilitlememeli.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  try {
    const res = await db.execute(sql`
      insert into rate_limit (id, key, count, last_request)
      values (gen_random_uuid()::text, ${"rl:" + key}, 1, ${now})
      on conflict (key) do update set
        count = case when rate_limit.last_request < ${now - windowMs} then 1 else rate_limit.count + 1 end,
        last_request = case when rate_limit.last_request < ${now - windowMs} then ${now} else rate_limit.last_request end
      returning count, last_request
    `);
    const row = res.rows[0] as { count: number; last_request: string | number };
    if (row.count <= limit) return { ok: true };
    const resetAt = Number(row.last_request) + windowMs;
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
  } catch (err) {
    console.error("[rate-limit] kontrol edilemedi, istek geçirildi", err);
    return { ok: true };
  }
}

/** Süresi çoktan dolmuş sayaç satırlarını siler (Better Auth'unkiler dahil). Günlük cron çağırır. Silinen satır sayısını döndürür. */
export async function purgeExpiredRateLimits(olderThanMs = 2 * 24 * 3600 * 1000): Promise<number> {
  const res = await db.execute(sql`delete from rate_limit where last_request < ${Date.now() - olderThanMs} returning id`);
  return res.rows.length;
}

export const tooManyMessage = (r: Extract<RateLimitResult, { ok: false }>) => {
  const minutes = Math.ceil(r.retryAfterSeconds / 60);
  return `Çok fazla deneme yaptınız. ${minutes <= 1 ? "Bir dakika" : `${minutes} dakika`} sonra tekrar deneyin.`;
};

/** İstemci IP'si. Vercel x-forwarded-for'u kendisi doldurur. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "bilinmiyor";
}
