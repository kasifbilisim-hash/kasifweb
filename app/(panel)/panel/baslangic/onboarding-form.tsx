"use client";

import { useActionState, useState } from "react";
import { submitClass } from "@/components/auth/auth-shell";
import { STEP_LABELS, STEPS, type OnboardingData, type Step } from "@/lib/validation/onboarding";
import { saveOnboarding, type OnboardingState } from "./actions";
import { FileUploader } from "./file-uploader";

const box = "mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 text-lg focus-visible:outline-tabela";

function Err({ id, errors }: { id: string; errors?: Record<string, string | undefined> }) {
  const msg = errors?.[id];
  return msg ? (
    <p id={`${id}-err`} className="mt-1 text-red-800">
      {msg}
    </p>
  ) : null;
}

function Text({
  name, label, hint, rows, defaultValue, errKey, errors, inputMode,
}: {
  name: string; label: string; hint?: string; rows?: number; defaultValue: string;
  errKey?: string; errors?: Record<string, string | undefined>; inputMode?: "numeric";
}) {
  const e = errKey ? errors?.[errKey] : undefined;
  const common = {
    id: name, name, defaultValue, className: box, "aria-invalid": !!e,
    "aria-describedby": [hint ? `${name}-hint` : "", e ? `${errKey}-err` : ""].filter(Boolean).join(" ") || undefined,
  };
  return (
    <div>
      <label htmlFor={name} className="ui">{label}</label>
      {hint ? <p id={`${name}-hint`} className="text-soluk">{hint}</p> : null}
      {rows ? <textarea rows={rows} {...common} /> : <input type="text" inputMode={inputMode} {...common} />}
      {errKey ? <Err id={errKey} errors={errors} /> : null}
    </div>
  );
}

function Choice({
  legend, name, options, defaultValue, errKey, errors, hint,
}: {
  legend: string; name: string; options: [string, string][]; defaultValue: string;
  errKey: string; errors?: Record<string, string | undefined>; hint?: string;
}) {
  return (
    <fieldset aria-describedby={errors?.[errKey] ? `${errKey}-err` : undefined}>
      <legend className="ui">{legend}</legend>
      {hint ? <p className="text-soluk">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {options.map(([value, label]) => (
          <label key={value} className="flex items-center gap-2">
            <input type="radio" name={name} value={value} defaultChecked={defaultValue === value} className="h-5 w-5 accent-emaye" />
            {label}
          </label>
        ))}
      </div>
      <Err id={errKey} errors={errors} />
    </fieldset>
  );
}

export function OnboardingForm({
  initial, hasAds, locked,
}: {
  initial: OnboardingData; hasAds: boolean; locked: boolean;
}) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(saveOnboarding, {});
  const steps: Step[] = STEPS.filter((s) => s !== "reklam" || hasAds);
  // Kullanıcının seçtiği adım, hangi sunucu yanıtı sırasında seçildiğiyle birlikte tutulur:
  // yeni bir hata yanıtı gelince eksik alanın adımı öne çıkar, kullanıcı gezinince onun seçimi geçerli olur.
  const [nav, setNav] = useState<{ forState: OnboardingState; step: Step } | null>(null);
  const errorStep = state.firstErrorStep && steps.includes(state.firstErrorStep) ? state.firstErrorStep : null;
  const current: Step = nav?.forState === state ? nav.step : (errorStep ?? nav?.step ?? "firma");
  const setCurrent = (step: Step) => setNav({ forState: state, step });
  const idx = steps.indexOf(current);
  const errors = state.errors;

  if (state.ok && state.message === "Formunuz gönderildi.") {
    return <p role="status" className="levha bg-tabela p-6 text-lg">Formunuz gönderildi. Taahhütname onaylanınca projeniz tasarım aşamasına geçer.</p>;
  }

  const f = state.values ?? initial;
  const show = (s: Step) => (s === current ? "space-y-6" : "hidden");
  const stepErrors = (s: Step) => Object.keys(errors ?? {}).some((k) => k.startsWith(s + "."));

  return (
    <form action={action} className="space-y-8" noValidate>
      <ol className="flex flex-wrap gap-2" aria-label="Adımlar">
        {steps.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => setCurrent(s)}
              aria-current={s === current ? "step" : undefined}
              className={`ui border-2 border-murekkep px-4 py-2 ${s === current ? "bg-emaye text-beyaz" : "bg-beyaz"} ${stepErrors(s) ? "border-red-800" : ""}`}
            >
              {i + 1}. {STEP_LABELS[s]}
              {stepErrors(s) ? <span className="sr-only"> (eksik alan var)</span> : null}
            </button>
          </li>
        ))}
      </ol>

      <fieldset key={state.version ?? 0} disabled={locked} className="min-w-0">
        <div className={show("firma")}>
          <h2 className="ui text-2xl">Firma</h2>
          <Text name="sector" label="Sektör" defaultValue={f.firma.sector} errKey="firma.sector" errors={errors} />
          <Text name="offering" label="Hizmetleriniz veya ürünleriniz" rows={4} defaultValue={f.firma.offering} errKey="firma.offering" errors={errors} />
          <Text name="region" label="Hedef bölge" hint="İl, ilçe ya da tüm Türkiye." defaultValue={f.firma.region} errKey="firma.region" errors={errors} />
          <Text name="competitors" label="Rakipleriniz" hint="Firma adı ya da site adresi. İsteğe bağlı." rows={3} defaultValue={f.firma.competitors} />
          <Text name="intro" label="Firmanızı kısaca tanıtın" hint="İsteğe bağlı." rows={5} defaultValue={f.firma.intro} />
        </div>

        <div className={show("marka")}>
          <h2 className="ui text-2xl">Marka</h2>
          <FileUploader name="logo" label="Logo" hint="JPG, PNG veya WEBP. En fazla 3,5 MB. İsteğe bağlı." max={1} initial={f.marka.logo ? [f.marka.logo] : []} disabled={locked} />
          <Text name="colors" label="Marka renkleriniz" hint="Varsa renk adı ya da kodu." defaultValue={f.marka.colors} />
          <Text name="likedSites" label="Beğendiğiniz siteler" hint="Adresleri alt alta yazın." rows={3} defaultValue={f.marka.likedSites} />
        </div>

        <div className={show("icerik")}>
          <h2 className="ui text-2xl">İçerik</h2>
          <Text name="pages" label="Sitede olmasını istediğiniz sayfalar" hint="Örnek: Ana sayfa, Hakkımızda, Hizmetler, İletişim." rows={3} defaultValue={f.icerik.pages} />
          <Choice legend="Metinleri kim yazsın?" name="copyMode" options={[["ben", "Ben göndereceğim"], ["siz", "Siz yazın"]]} defaultValue={f.icerik.copyMode} errKey="icerik.copyMode" errors={errors} />
          <Text name="contentText" label="Metinleriniz" hint={'"Siz yazın" seçtiyseniz boş bırakabilirsiniz.'} rows={6} defaultValue={f.icerik.contentText} errKey="icerik.contentText" errors={errors} />
          <FileUploader name="photos" label="Fotoğraflar" hint="En fazla 10 adet. JPG, PNG veya WEBP, her biri en fazla 3,5 MB. İsteğe bağlı." max={10} initial={f.icerik.photos} disabled={locked} />
        </div>

        <div className={show("alanAdi")}>
          <h2 className="ui text-2xl">Alan adı</h2>
          <p className="text-soluk">Alan adı sizin adınıza kayıtlı olmalı. Abonelik bitse de sizde kalır.</p>
          <Choice legend="Alan adınız var mı?" name="hasDomain" options={[["evet", "Evet"], ["hayir", "Hayır"]]} defaultValue={f.alanAdi.hasDomain} errKey="alanAdi.hasDomain" errors={errors} />
          <Text name="domainName" label="Alan adı" hint="Örnek: ornekfirma.com" defaultValue={f.alanAdi.domainName} errKey="alanAdi.domainName" errors={errors} />
          <Choice legend="Kimin adına kayıtlı?" name="registeredTo" options={[["firma", "Firmam adına"], ["baska", "Başka biri adına"], ["bilmiyorum", "Bilmiyorum"]]} defaultValue={f.alanAdi.registeredTo} errKey="alanAdi.registeredTo" errors={errors} />
          <Choice legend="DNS ayarlarına erişiminiz var mı?" name="dnsAccess" options={[["var", "Var"], ["yok", "Yok"], ["bilmiyorum", "Bilmiyorum"]]} defaultValue={f.alanAdi.dnsAccess} errKey="alanAdi.dnsAccess" errors={errors} />
          <p className="text-soluk">Alan adınız yoksa sizin adınıza biz kaydederiz. Kayıt bedeli kayıttan önce size bildirilir ve onayınız alınır.</p>
        </div>

        {hasAds && (
          <div className={show("reklam")}>
            <h2 className="ui text-2xl">Google Ads</h2>
            <p className="text-soluk">Reklam bütçesi size aittir ve kartınızdan doğrudan Google&apos;a ödenir.</p>
            <Choice legend="Google Ads hesabınız var mı?" name="hasAdsAccount" options={[["evet", "Evet"], ["hayir", "Hayır"]]} defaultValue={f.reklam.hasAccount} errKey="reklam.hasAccount" errors={errors} />
            <Text name="budgetTL" label="Hedef aylık reklam bütçesi (TL)" inputMode="numeric" defaultValue={f.reklam.monthlyBudgetKurus ? String(f.reklam.monthlyBudgetKurus / 100) : ""} errKey="reklam.monthlyBudgetKurus" errors={errors} />
            <fieldset aria-describedby={errors?.["reklam.goals"] ? "reklam.goals-err" : undefined}>
              <legend className="ui">Hedeflenen işlem</legend>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                {([["arama", "Telefonla arama"], ["form", "Form doldurma"], ["whatsapp", "WhatsApp mesajı"]] as const).map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2">
                    <input type="checkbox" name="goals" value={v} defaultChecked={f.reklam.goals.includes(v)} className="h-5 w-5 accent-emaye" />
                    {l}
                  </label>
                ))}
              </div>
              <Err id="reklam.goals" errors={errors} />
            </fieldset>
            <Text name="adsRegions" label="Reklam bölgesi" defaultValue={f.reklam.regions} errKey="reklam.regions" errors={errors} />
          </div>
        )}
      </fieldset>

      {state.message && !state.ok ? <p role="alert" className="border-2 border-red-800 p-4 text-red-800">{state.message}</p> : null}
      {state.ok ? <p role="status" className="text-emaye">{state.message}</p> : null}

      {locked ? null : (
        <div className="flex flex-wrap items-center gap-4 border-t-4 border-murekkep pt-6">
          {idx > 0 && (
            <button type="button" onClick={() => setCurrent(steps[idx - 1])} className="ui border-2 border-murekkep px-6 py-3">
              Geri
            </button>
          )}
          {idx < steps.length - 1 ? (
            <button type="button" onClick={() => setCurrent(steps[idx + 1])} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep">
              İleri
            </button>
          ) : (
            <button type="submit" name="intent" value="submit" disabled={pending} className={submitClass}>
              {pending ? "Gönderiliyor" : "Formu gönder"}
            </button>
          )}
          <button type="submit" name="intent" value="draft" disabled={pending} className="ui underline underline-offset-4">
            Taslağı kaydet
          </button>
        </div>
      )}
    </form>
  );
}
