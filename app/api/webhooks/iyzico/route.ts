import { NextResponse } from "next/server";
import { handleOrderEvent } from "@/lib/subscriptions";
import { verifyWebhookSignature, webhookPayloadSchema } from "@/lib/iyzico/webhook";

export async function POST(request: Request) {
  const merchantId = process.env.IYZICO_MERCHANT_ID;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!merchantId || !secretKey) {
    console.error("[webhook] IYZICO_MERCHANT_ID / IYZICO_SECRET_KEY tanımlı değil");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = webhookPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // İmza zorunlu: başlık yoksa ya da eşleşmezse hiçbir şey işlenmez.
  const signature = request.headers.get("x-iyz-signature-v3");
  if (!verifyWebhookSignature(parsed.data, signature, merchantId, secretKey)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  try {
    const result = await handleOrderEvent({
      type: parsed.data.iyziEventType,
      subscriptionReferenceCode: parsed.data.subscriptionReferenceCode,
      orderReferenceCode: parsed.data.orderReferenceCode,
    });
    // Abonelik ya da sipariş henüz bulunamadıysa 2xx dönmeyiz; iyzico bildirimi tekrar gönderir.
    if (result === "subscription_not_found" || result === "order_not_found") {
      return NextResponse.json({ result }, { status: 404 });
    }
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[webhook] işlenemedi", err);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
