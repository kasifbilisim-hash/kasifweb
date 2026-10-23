import "server-only";
import { z } from "zod";
import { iyzicoRequest } from "./client";

/* Endpoint ve alan adları docs.iyzico.com Abonelik API referansından alındı (Beta). */

const refCode = z.string().min(1);

const checkoutInitSchema = z.object({
  token: refCode,
  checkoutFormContent: z.string().min(1),
  tokenExpireTime: z.number().optional(),
});

export type CheckoutCustomer = {
  name: string;
  surname: string;
  email: string;
  gsmNumber: string; // +905XXXXXXXXX
  identityNumber: string;
  billingAddress: { address: string; contactName: string; city: string; country: string };
};

/** POST /v2/subscription/checkoutform/initialize */
export async function initializeCheckoutForm(args: {
  callbackUrl: string;
  pricingPlanReferenceCode: string;
  customer: CheckoutCustomer;
  conversationId: string;
}) {
  const res = await iyzicoRequest<unknown>("POST", "/v2/subscription/checkoutform/initialize", {
    locale: "tr",
    conversationId: args.conversationId,
    callbackUrl: args.callbackUrl,
    pricingPlanReferenceCode: args.pricingPlanReferenceCode,
    subscriptionInitialStatus: "ACTIVE",
    customer: args.customer,
  });
  return checkoutInitSchema.parse(res);
}

const subscriptionDataSchema = z.object({
  referenceCode: refCode,
  parentReferenceCode: z.string().optional(),
  customerReferenceCode: refCode,
  subscriptionStatus: z.string(),
  pricingPlanReferenceCode: z.string().optional(),
  startDate: z.number().optional(), // epoch ms
  endDate: z.number().optional(),
});

/** GET /v2/subscription/checkoutform/{token} */
export async function retrieveCheckoutResult(token: string) {
  const res = await iyzicoRequest<{ data?: unknown }>(
    "GET",
    `/v2/subscription/checkoutform/${encodeURIComponent(token)}`,
  );
  return subscriptionDataSchema.parse(res.data);
}

const orderSchema = z.object({
  referenceCode: refCode,
  price: z.number(),
  currencyCode: z.string(),
  startPeriod: z.number().optional(),
  orderStatus: z.enum(["WAITING", "SUCCESS", "FAILED"]),
});

const subscriptionDetailSchema = z.object({
  referenceCode: refCode,
  customerReferenceCode: refCode,
  subscriptionStatus: z.string(), // ACTIVE | PENDING | UNPAID | UPGRADED | CANCELED | EXPIRED
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  orders: z.array(orderSchema).default([]),
});

export type SubscriptionDetail = z.infer<typeof subscriptionDetailSchema>;

/** GET /v2/subscription/subscriptions/{subscriptionReferenceCode}  (data.items[]) */
export async function getSubscription(subscriptionReferenceCode: string): Promise<SubscriptionDetail> {
  const res = await iyzicoRequest<{ data?: { items?: unknown[] } }>(
    "GET",
    `/v2/subscription/subscriptions/${encodeURIComponent(subscriptionReferenceCode)}`,
  );
  const item = res.data?.items?.[0];
  return subscriptionDetailSchema.parse(item);
}

/** POST /v2/subscription/subscriptions/{subscriptionReferenceCode}/cancel */
export async function cancelSubscription(subscriptionReferenceCode: string) {
  await iyzicoRequest<unknown>(
    "POST",
    `/v2/subscription/subscriptions/${encodeURIComponent(subscriptionReferenceCode)}/cancel`,
  );
}

/** POST /v2/subscription/card-update/checkoutform/initialize (Aşama 6'da kullanılacak) */
export async function initializeCardUpdate(args: {
  callbackUrl: string;
  customerReferenceCode: string;
  subscriptionReferenceCode?: string;
}) {
  const res = await iyzicoRequest<unknown>("POST", "/v2/subscription/card-update/checkoutform/initialize", {
    locale: "tr",
    ...args,
  });
  return checkoutInitSchema.parse(res);
}

// ---- Ürün ve plan (scripts/iyzico-sync.ts) ----

const planSchema = z.object({
  referenceCode: refCode,
  price: z.number(),
  currencyCode: z.string(),
  paymentInterval: z.string(),
  recurrenceCount: z.number().nullable().optional(),
});

/** POST /v2/subscription/products */
export async function createProduct(name: string, description: string) {
  const res = await iyzicoRequest<{ data?: { referenceCode?: string } }>(
    "POST",
    "/v2/subscription/products",
    { locale: "tr", name, description },
  );
  return refCode.parse(res.data?.referenceCode);
}

/** POST /v2/subscription/products/{productReferenceCode}/pricing-plans */
export async function createPlan(args: {
  productReferenceCode: string;
  name: string;
  priceKurus: number;
  recurrenceCount: number;
}) {
  const res = await iyzicoRequest<{ data?: { referenceCode?: string } }>(
    "POST",
    `/v2/subscription/products/${encodeURIComponent(args.productReferenceCode)}/pricing-plans`,
    {
      locale: "tr",
      name: args.name,
      price: args.priceKurus / 100,
      currencyCode: "TRY",
      paymentInterval: "MONTHLY",
      paymentIntervalCount: 1,
      planPaymentType: "RECURRING",
      recurrenceCount: args.recurrenceCount,
    },
  );
  return refCode.parse(res.data?.referenceCode);
}

/** GET /v2/subscription/pricing-plans/{pricingPlanReferenceCode} */
export async function getPlan(pricingPlanReferenceCode: string) {
  const res = await iyzicoRequest<{ data?: unknown }>(
    "GET",
    `/v2/subscription/pricing-plans/${encodeURIComponent(pricingPlanReferenceCode)}`,
  );
  return planSchema.parse(res.data);
}
