import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { writeAudit } from "@/lib/audit";
import { addMonthsUTC } from "@/lib/dates";
import { db, schema } from "@/lib/db";
import { COMMITMENT_MONTHS } from "@/lib/legal";
import { getSubscription, retrieveCheckoutResult, type SubscriptionDetail } from "@/lib/iyzico/subscription";
import { notify } from "@/lib/notify";

type Order = SubscriptionDetail["orders"][number];

const toKurus = (price: number) => Math.round(price * 100);

/**
 * Bir iyzico siparişini (aylık çekim) payments tablosuna yazar. iyzico_order_ref unique olduğu için
 * aynı sipariş iki kez gelirse güncellenir, çoğalmaz. Durum değiştiyse true döner.
 */
async function upsertPayment(subscriptionId: string, order: Order, success: boolean): Promise<boolean> {
  const status = success ? "success" : "failed";
  const [existing] = await db
    .select({ status: schema.payments.status })
    .from(schema.payments)
    .where(eq(schema.payments.iyzicoOrderRef, order.referenceCode));

  await db
    .insert(schema.payments)
    .values({
      subscriptionId,
      iyzicoOrderRef: order.referenceCode,
      amountKurus: toKurus(order.price),
      status,
      paidAt: success ? new Date(order.startPeriod ?? Date.now()) : null,
      rawData: order,
    })
    .onConflictDoUpdate({
      target: schema.payments.iyzicoOrderRef,
      set: { status, amountKurus: toKurus(order.price), rawData: order },
    });

  return existing?.status !== status;
}

export type ActivationResult =
  | { ok: true; subscriptionId: string }
  | { ok: false; reason: "unknown_token" | "not_active" | "iyzico_error"; subscriptionId?: string };

/**
 * Checkout callback'inden sonra çağrılır. Callback parametresine güvenmez: sonucu iyzico'dan sorgular.
 * Adımlar idempotenttir; yarıda kalırsa tekrar çağrılınca tamamlanır. Durum "active" en son yazılır.
 */
export async function activateFromCheckout(token: string): Promise<ActivationResult> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.iyzicoCheckoutToken, token));
  if (!sub) return { ok: false, reason: "unknown_token" };

  let result: Awaited<ReturnType<typeof retrieveCheckoutResult>>;
  let detail: SubscriptionDetail;
  try {
    result = await retrieveCheckoutResult(token);
    if (result.subscriptionStatus !== "ACTIVE") {
      return { ok: false, reason: "not_active", subscriptionId: sub.id };
    }
    detail = await getSubscription(result.referenceCode);
  } catch (err) {
    console.error("[iyzico] checkout sonucu sorgulanamadı", err);
    return { ok: false, reason: "iyzico_error", subscriptionId: sub.id };
  }

  // 1) Ödeme kayıtları
  for (const order of detail.orders) {
    if (order.orderStatus === "WAITING") continue;
    await upsertPayment(sub.id, order, order.orderStatus === "SUCCESS");
  }

  // 2) Proje ve taahhütname kaydı (firma başına yoksa)
  const [project] = await db
    .select({ id: schema.projects.id })
    .from(schema.projects)
    .where(eq(schema.projects.companyId, sub.companyId));
  if (!project) {
    const [created] = await db
      .insert(schema.projects)
      .values({ companyId: sub.companyId, stage: "taahhutname_bekleniyor" })
      .returning({ id: schema.projects.id });
    await db.insert(schema.projectEvents).values({
      projectId: created.id,
      stage: "taahhutname_bekleniyor",
      description: "Aboneliğiniz başladı. Taahhütnameyi indirip imzalayarak yükleyin.",
    });
  }
  const [doc] = await db
    .select({ id: schema.commitmentDocuments.id })
    .from(schema.commitmentDocuments)
    .where(eq(schema.commitmentDocuments.companyId, sub.companyId));
  if (!doc) {
    await db.insert(schema.commitmentDocuments).values({ companyId: sub.companyId });
  }

  // 3) Abonelik durumu en son
  const alreadyActive = sub.status === "active" && sub.iyzicoSubscriptionRef === result.referenceCode;
  if (!alreadyActive) {
    const startedAt = new Date(result.startDate ?? Date.now());
    await db
      .update(schema.subscriptions)
      .set({
        status: "active",
        iyzicoSubscriptionRef: result.referenceCode,
        iyzicoCustomerRef: result.customerReferenceCode,
        startedAt,
        commitmentEndsAt: addMonthsUTC(startedAt, COMMITMENT_MONTHS),
      })
      .where(eq(schema.subscriptions.id, sub.id));
    await writeAudit({
      actorUserId: null,
      action: "subscription.activated",
      targetTable: "subscriptions",
      targetId: sub.id,
      details: { from: sub.status, to: "active", iyzicoSubscriptionRef: result.referenceCode },
    });
    await notify({ to: "customer", template: "welcome", subjectRef: sub.id });
  }

  return { ok: true, subscriptionId: sub.id };
}

export type OrderEvent = {
  type: "subscription.order.success" | "subscription.order.failure";
  subscriptionReferenceCode: string;
  orderReferenceCode: string;
};

export type OrderEventResult = "processed" | "duplicate" | "subscription_not_found" | "order_not_found";

/** Webhook işleyicisi. Aynı bildirim iki kez gelirse ikinci seferde "duplicate" döner, durum bozulmaz. */
export async function handleOrderEvent(event: OrderEvent): Promise<OrderEventResult> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.iyzicoSubscriptionRef, event.subscriptionReferenceCode));
  // Bildirim callback'ten önce gelmiş olabilir: 2xx dönmeyip iyzico'nun yeniden denemesini bekleriz.
  if (!sub) return "subscription_not_found";

  const detail = await getSubscription(event.subscriptionReferenceCode);
  const order = detail.orders.find((o) => o.referenceCode === event.orderReferenceCode);
  if (!order) return "order_not_found";

  const success = event.type === "subscription.order.success";
  const paymentChanged = await upsertPayment(sub.id, order, success);

  // Durum geçişi ödeme kaydının değişip değişmediğinden bağımsızdır (koşullu güncelleme, tekrar çağrılsa zararsız).
  let transitioned = false;
  if (success && sub.status === "payment_failed") {
    await db
      .update(schema.subscriptions)
      .set({ status: "active" })
      .where(and(eq(schema.subscriptions.id, sub.id), eq(schema.subscriptions.status, "payment_failed")));
    await writeAudit({
      actorUserId: null,
      action: "subscription.payment_recovered",
      targetTable: "subscriptions",
      targetId: sub.id,
      details: { from: "payment_failed", to: "active", orderRef: order.referenceCode },
    });
    transitioned = true;
  } else if (!success && sub.status === "active") {
    await db
      .update(schema.subscriptions)
      .set({ status: "payment_failed" })
      .where(and(eq(schema.subscriptions.id, sub.id), eq(schema.subscriptions.status, "active")));
    await writeAudit({
      actorUserId: null,
      action: "subscription.payment_failed",
      targetTable: "subscriptions",
      targetId: sub.id,
      details: { from: "active", to: "payment_failed", orderRef: order.referenceCode },
    });
    transitioned = true;
  }

  if (!paymentChanged && !transitioned) return "duplicate";

  const template = success ? "payment_received" : "payment_failed";
  await notify({ to: "customer", template, subjectRef: sub.id, data: { orderRef: order.referenceCode } });
  if (!success) await notify({ to: "admin", template, subjectRef: sub.id, data: { orderRef: order.referenceCode } });
  return "processed";
}

export type SyncResult = "updated" | "unchanged" | "skipped";

/**
 * Webhook'u kaçırılmış olabilecek bir aboneliği iyzico'dan sorgulayıp yerel kayıtla eşler (günlük cron).
 * Idempotenttir: yerel durum zaten doğruysa hiçbir şey yazmaz. Ödeme bildirimi yalnızca ödeme kaydı
 * değiştiğinde gönderilir, webhook ile aynı mantık.
 */
export async function syncSubscription(subscriptionId: string): Promise<SyncResult> {
  const [sub] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, subscriptionId));
  if (!sub?.iyzicoSubscriptionRef) return "skipped";

  const detail = await getSubscription(sub.iyzicoSubscriptionRef);
  let changed = false;

  const settled = detail.orders.filter((o) => o.orderStatus !== "WAITING").sort((a, b) => (b.startPeriod ?? 0) - (a.startPeriod ?? 0));
  for (const order of settled) {
    const success = order.orderStatus === "SUCCESS";
    if (await upsertPayment(sub.id, order, success)) {
      changed = true;
      await notify({ to: "customer", template: success ? "payment_received" : "payment_failed", subjectRef: sub.id, data: { orderRef: order.referenceCode } });
      if (!success) await notify({ to: "admin", template: "payment_failed", subjectRef: sub.id });
    }
  }

  const move = async (to: "cancelled" | "expired" | "payment_failed" | "active", from: (typeof sub)["status"][], action: string) => {
    const rows = await db
      .update(schema.subscriptions)
      .set({ status: to, ...(to === "cancelled" ? { cancelledAt: new Date() } : {}) })
      .where(and(eq(schema.subscriptions.id, sub.id), inArray(schema.subscriptions.status, from)))
      .returning({ id: schema.subscriptions.id });
    if (rows.length === 0) return;
    changed = true;
    await writeAudit({ actorUserId: null, action, targetTable: "subscriptions", targetId: sub.id, details: { from: sub.status, to, source: "cron_sync", iyzicoStatus: detail.subscriptionStatus } });
  };

  const live: (typeof sub)["status"][] = ["active", "payment_failed", "cancel_requested"];
  if (detail.subscriptionStatus === "CANCELED") await move("cancelled", live, "subscription.cancelled_by_iyzico");
  else if (detail.subscriptionStatus === "EXPIRED") await move("expired", live, "subscription.expired");
  else if (settled[0]?.orderStatus === "FAILED") await move("payment_failed", ["active"], "subscription.payment_failed");
  else if (settled[0]?.orderStatus === "SUCCESS") await move("active", ["payment_failed"], "subscription.payment_recovered");

  return changed ? "updated" : "unchanged";
}
