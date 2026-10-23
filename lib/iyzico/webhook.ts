import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/*
 * Abonelik webhook'u. Kaynak: docs.iyzico.com/en/advanced/webhook
 * Başlık: X-IYZ-SIGNATURE-V3 (hesapta imza özelliği açık olmalı: entegrasyon@iyzico.com)
 * İmza: hex(HMAC-SHA256(secretKey, merchantId + secretKey + eventType + subscriptionReferenceCode
 *                                   + orderReferenceCode + customerReferenceCode))
 * Dokümandaki "eventType" payload'daki iyziEventType alanıdır.
 */

export const webhookPayloadSchema = z.object({
  iyziEventType: z.enum(["subscription.order.success", "subscription.order.failure"]),
  subscriptionReferenceCode: z.string().min(1),
  orderReferenceCode: z.string().min(1),
  customerReferenceCode: z.string().min(1),
  iyziReferenceCode: z.string().optional(),
  iyziEventTime: z.number().optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export function computeWebhookSignature(
  payload: Pick<
    WebhookPayload,
    "iyziEventType" | "subscriptionReferenceCode" | "orderReferenceCode" | "customerReferenceCode"
  >,
  merchantId: string,
  secretKey: string,
): string {
  const data =
    merchantId +
    secretKey +
    payload.iyziEventType +
    payload.subscriptionReferenceCode +
    payload.orderReferenceCode +
    payload.customerReferenceCode;
  return createHmac("sha256", secretKey).update(data).digest("hex");
}

export function verifyWebhookSignature(
  payload: WebhookPayload,
  header: string | null,
  merchantId: string,
  secretKey: string,
): boolean {
  if (!header) return false;
  const expected = Buffer.from(computeWebhookSignature(payload, merchantId, secretKey), "utf8");
  const received = Buffer.from(header.trim().toLowerCase(), "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}
