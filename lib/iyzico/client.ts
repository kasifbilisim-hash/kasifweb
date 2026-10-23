import "server-only";
import { createHmac, randomUUID } from "node:crypto";

/*
 * iyzico istemcisi. Kaynak (doğrulandı):
 * - Kimlik doğrulama: docs.iyzico.com/en/getting-started/preliminaries/authentication/hmacsha256-auth
 *   payload = randomKey + uri.path + body ; imza = HMAC-SHA256(payload, secretKey) hex ;
 *   Authorization = "IYZWSv2 " + base64("apiKey:<key>&randomKey:<rnd>&signature:<imza>")
 * - Sandbox: https://sandbox-api.iyzipay.com  Canlı: https://api.iyzipay.com
 */

export class IyzicoConfigError extends Error {}

export class IyzicoApiError extends Error {
  constructor(
    message: string,
    readonly errorCode?: string,
    readonly httpStatus?: number,
  ) {
    super(message);
  }
}

function config() {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
  if (!apiKey || !secretKey) {
    throw new IyzicoConfigError("IYZICO_API_KEY ve IYZICO_SECRET_KEY tanımlı değil.");
  }
  return { apiKey, secretKey, baseUrl };
}

export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

export function buildAuthorization(args: {
  apiKey: string;
  secretKey: string;
  randomKey: string;
  path: string;
  body: string;
}): string {
  const payload = args.randomKey + args.path + args.body;
  const signature = createHmac("sha256", args.secretKey).update(payload).digest("hex");
  const credentials = `apiKey:${args.apiKey}&randomKey:${args.randomKey}&signature:${signature}`;
  return `IYZWSv2 ${Buffer.from(credentials, "utf8").toString("base64")}`;
}

type Method = "GET" | "POST" | "DELETE";

/**
 * İmzalanan gövde ile gönderilen gövde birebir aynı string olmalı.
 * GET isteklerinde query string kullanılmaz (imza yalnızca path içerir).
 */
export async function iyzicoRequest<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const { apiKey, secretKey, baseUrl } = config();
  const bodyString = body === undefined ? "" : JSON.stringify(body);
  const randomKey = `${Date.now()}${randomUUID().replace(/-/g, "").slice(0, 9)}`;

  const res = await fetch(baseUrl + path, {
    method,
    headers: {
      Authorization: buildAuthorization({ apiKey, secretKey, randomKey, path, body: bodyString }),
      "x-iyzi-rnd": randomKey,
      "Content-Type": "application/json",
    },
    body: bodyString || undefined,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | { status?: string; errorCode?: string; errorMessage?: string }
    | null;

  if (!res.ok || !json || json.status === "failure") {
    throw new IyzicoApiError(
      json?.errorMessage ?? `iyzico isteği başarısız (HTTP ${res.status})`,
      json?.errorCode,
      res.status,
    );
  }
  return json as T;
}
