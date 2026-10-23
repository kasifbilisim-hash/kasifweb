"use server";

import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getPanelData } from "@/lib/panel-data";
import { maybeAdvanceToDesign } from "@/lib/projects";
import { rateLimit, tooManyMessage } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { companyPrefix } from "@/lib/storage";
import { storeUpload } from "@/lib/uploads";
import {
  parseOnboardingForm,
  stepOfKey,
  validateForSubmit,
  type FileRef,
  type OnboardingData,
  type Step,
  type SubmitErrors,
} from "@/lib/validation/onboarding";

export type OnboardingState = {
  ok?: boolean;
  message?: string;
  errors?: SubmitErrors;
  firstErrorStep?: Step;
  savedAt?: number;
  // React 19 form action sonrası kontrolsüz alanları sıfırlar; yazılanları geri göndeririz ki alanlar bu değerlerle yeniden kurulsun.
  values?: OnboardingData;
  version?: number;
};

async function context() {
  const user = await requireUser();
  const data = await getPanelData(user.id);
  if (!data?.subscription || !data.package) return null;
  return { user, ...data, hasAds: data.package.includesAds };
}

export async function saveOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const ctx = await context();
  if (!ctx) return { message: "Aktif aboneliğiniz yok." };
  if (ctx.onboarding?.status === "gonderildi") return { message: "Form zaten gönderildi, değişiklik için destek talebi açın." };

  const parsed = parseOnboardingForm(formData);
  if ("error" in parsed) return { message: parsed.error };
  const { data } = parsed;

  // Dosya referansları yalnızca bu firmanın klasöründen olabilir (başkasının yolunu yazmayı engeller).
  const prefix = companyPrefix(ctx.company.id);
  const own = (f: FileRef | null) => !f || f.path.startsWith(prefix + "onboarding/");
  if (!own(data.marka.logo) || !data.icerik.photos.every(own)) return { message: "Dosya bilgisi geçersiz." };

  const submit = formData.get("intent") === "submit";
  if (submit) {
    const errors = validateForSubmit(data, ctx.hasAds);
    const keys = Object.keys(errors);
    if (keys.length > 0) {
      return { errors, firstErrorStep: stepOfKey(keys[0]), message: "Eksik alanlar var.", values: data, version: Date.now() };
    }
  }

  await db
    .insert(schema.onboardingForms)
    .values({ companyId: ctx.company.id, data, status: submit ? "gonderildi" : "taslak" })
    .onConflictDoUpdate({
      target: schema.onboardingForms.companyId,
      set: { data, status: submit ? "gonderildi" : "taslak" },
    });

  if (!submit) return { ok: true, message: "Taslak kaydedildi.", savedAt: Date.now(), values: data, version: Date.now() };

  await writeAudit({
    actorUserId: ctx.user.id,
    action: "onboarding.submitted",
    targetTable: "onboarding_forms",
    targetId: ctx.company.id,
  });
  await notify({ to: "admin", template: "onboarding_submitted", subjectRef: ctx.company.id });
  await maybeAdvanceToDesign(ctx.company.id);

  revalidatePath("/panel/baslangic");
  revalidatePath("/panel");
  return { ok: true, message: "Formunuz gönderildi." };
}

export type UploadedFile = { ok: true; file: FileRef } | { ok: false; error: string };

export async function uploadOnboardingFile(formData: FormData): Promise<UploadedFile> {
  const ctx = await context();
  if (ctx) {
    const limited = await rateLimit(`onboarding-upload:${ctx.user.id}`, 60, 3600);
    if (!limited.ok) return { ok: false, error: tooManyMessage(limited) };
  }
  if (!ctx) return { ok: false, error: "Aktif aboneliğiniz yok." };
  if (ctx.onboarding?.status === "gonderildi") return { ok: false, error: "Form zaten gönderildi." };

  const result = await storeUpload({
    companyId: ctx.company.id,
    folder: "onboarding",
    file: formData.get("file"),
    allowed: ["jpg", "png", "webp"],
  });
  return result.ok ? { ok: true, file: result.file } : { ok: false, error: result.error };
}
