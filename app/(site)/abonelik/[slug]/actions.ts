"use server";

import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { IyzicoApiError, IyzicoConfigError } from "@/lib/iyzico/client";
import { initializeCheckoutForm } from "@/lib/iyzico/subscription";
import { AGREEMENT_VERSIONS } from "@/lib/legal";
import { rateLimit, tooManyMessage } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { checkoutSchema, normalizeTrPhone, type CheckoutField } from "@/lib/validation/checkout";

export type CheckoutState = {
  errors?: Partial<Record<CheckoutField, string>>;
  message?: string;
  checkoutFormContent?: string;
};

// Bu durumlardaki bir abonelik varken ikinci abonelik açılmaz.
const BLOCKING = ["active", "payment_failed", "cancel_requested"] as const;

export async function startCheckout(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await requireUser();
  const limited = await rateLimit(`checkout:${user.id}`, 10, 3600);
  if (!limited.ok) return { message: tooManyMessage(limited) };

  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: NonNullable<CheckoutState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as CheckoutField;
      errors[key] ??= issue.message;
    }
    return { errors };
  }
  const input = parsed.data;

  const [pkg] = await db.select().from(schema.packages).where(eq(schema.packages.slug, input.slug));
  if (!pkg || !pkg.active || pkg.billingType !== "subscription" || pkg.monthlyPriceKurus === null || !pkg.iyzicoPlanRef) {
    return { message: "Bu paket için abonelik şu an açık değil." };
  }

  // Firma: kullanıcı başına bir firma
  const companyValues = {
    legalName: input.legalName,
    taxOffice: input.taxOffice,
    taxNumber: input.taxNumber,
    address: input.address,
    city: input.city,
    contactName: input.contactName,
    contactPhone: normalizeTrPhone(input.contactPhone)!,
  };
  const [existingCompany] = await db
    .select({ id: schema.companies.id })
    .from(schema.companies)
    .where(eq(schema.companies.userId, user.id));
  let companyId = existingCompany?.id;
  if (companyId) {
    // Canlı aboneliği olan firmanın unvan/vergi/adres bilgisi buradan değiştirilemez (imzalanan sözleşmedeki kimlik);
    // değişiklik destek talebiyle ve yönetici onayıyla yapılır. Bu yüzden kontrol güncellemeden önce yapılır.
    const [blocking] = await db
      .select({ id: schema.subscriptions.id })
      .from(schema.subscriptions)
      .where(and(eq(schema.subscriptions.companyId, companyId), inArray(schema.subscriptions.status, [...BLOCKING])));
    if (blocking) return { message: "Firmanızın zaten bir aboneliği var. Panelinizden takip edebilirsiniz." };
    await db.update(schema.companies).set(companyValues).where(eq(schema.companies.id, companyId));
  } else {
    const [created] = await db
      .insert(schema.companies)
      .values({ userId: user.id, ...companyValues })
      .returning({ id: schema.companies.id });
    companyId = created.id;
  }

  // Sözleşme onayları: belge, versiyon, tarih, IP, kullanıcı
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const userAgent = h.get("user-agent");
  await db.insert(schema.agreementAcceptances).values(
    (["mesafeli_satis", "on_bilgilendirme", "kvkk"] as const).map((documentType) => ({
      userId: user.id,
      documentType,
      documentVersion: AGREEMENT_VERSIONS[documentType],
      ip,
      userAgent,
    })),
  );

  // Aynı firma + paket için bekleyen kayıt varsa yeniden kullan
  const [pending] = await db
    .select({ id: schema.subscriptions.id })
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.companyId, companyId),
        eq(schema.subscriptions.packageId, pkg.id),
        eq(schema.subscriptions.status, "pending"),
      ),
    );
  const subscriptionId =
    pending?.id ??
    (
      await db
        .insert(schema.subscriptions)
        .values({ companyId, packageId: pkg.id })
        .returning({ id: schema.subscriptions.id })
    )[0].id;

  const nameParts = input.contactName.split(/\s+/);
  const surname = nameParts.pop()!;
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  try {
    const checkout = await initializeCheckoutForm({
      callbackUrl: `${baseUrl}/api/iyzico/callback`,
      pricingPlanReferenceCode: pkg.iyzicoPlanRef,
      conversationId: subscriptionId,
      customer: {
        name: nameParts.join(" "),
        surname,
        email: user.email,
        gsmNumber: normalizeTrPhone(input.contactPhone)!,
        identityNumber: input.identityNumber, // saklanmaz, yalnızca iyzico'ya iletilir
        billingAddress: {
          address: input.address,
          contactName: input.contactName,
          city: input.city,
          country: "Turkey",
        },
      },
    });
    await db
      .update(schema.subscriptions)
      .set({ iyzicoCheckoutToken: checkout.token })
      .where(eq(schema.subscriptions.id, subscriptionId));
    await writeAudit({
      actorUserId: user.id,
      action: "subscription.checkout_started",
      targetTable: "subscriptions",
      targetId: subscriptionId,
      details: { package: pkg.slug },
    });
    return { checkoutFormContent: checkout.checkoutFormContent };
  } catch (err) {
    if (err instanceof IyzicoConfigError) {
      console.error("[checkout]", err.message);
      return { message: "Ödeme sistemi henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin." };
    }
    console.error("[checkout] iyzico hatası", err instanceof IyzicoApiError ? err.errorCode : "", err);
    return { message: "Ödeme formu açılamadı. Bilgilerinizi kontrol edip tekrar deneyin." };
  }
}
