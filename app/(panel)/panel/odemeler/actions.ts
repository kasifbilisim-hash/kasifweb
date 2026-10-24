"use server";

import { writeAudit } from "@/lib/audit";
import { IyzicoApiError, IyzicoConfigError } from "@/lib/iyzico/client";
import { initializeCardUpdate } from "@/lib/iyzico/subscription";
import { getPanelData } from "@/lib/panel-data";
import { requireUser } from "@/lib/session";

export type CardUpdateState = { message?: string; checkoutFormContent?: string };

/** iyzico kart güncelleme formunu açar. Kart bilgisi bize hiç ulaşmaz. */
export async function startCardUpdate(): Promise<CardUpdateState> {
  const user = await requireUser();
  const data = await getPanelData(user.id);
  const sub = data?.subscription;
  if (!sub?.iyzicoCustomerRef || !sub.iyzicoSubscriptionRef) return { message: "Kartı değiştirilecek aktif bir abonelik yok." };
  if (sub.status === "cancel_requested") return { message: "İptal talebiniz değerlendirilirken kart değiştirilemez, destek talebi açın." };

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  try {
    const res = await initializeCardUpdate({
      callbackUrl: `${baseUrl}/api/iyzico/kart-callback`,
      customerReferenceCode: sub.iyzicoCustomerRef,
      subscriptionReferenceCode: sub.iyzicoSubscriptionRef,
    });
    await writeAudit({
      actorUserId: user.id,
      action: "subscription.card_update_started",
      targetTable: "subscriptions",
      targetId: sub.id,
    });
    return { checkoutFormContent: res.checkoutFormContent };
  } catch (err) {
    if (err instanceof IyzicoConfigError) {
      console.error("[card-update]", err.message);
      return { message: "Ödeme sistemi henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin." };
    }
    console.error("[card-update] iyzico hatası", err instanceof IyzicoApiError ? err.errorCode : "", err);
    return { message: "Kart güncelleme formu açılamadı. Biraz sonra tekrar deneyin." };
  }
}
