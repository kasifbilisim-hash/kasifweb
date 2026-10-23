"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitClass } from "@/components/auth/auth-shell";
import { AGREEMENTS } from "@/lib/legal";
import type { CheckoutField } from "@/lib/validation/checkout";
import { startCheckout, type CheckoutState } from "./actions";
import { IyzicoForm } from "@/components/iyzico-form";

export type CompanyDefaults = Partial<
  Record<"legalName" | "taxOffice" | "taxNumber" | "address" | "city" | "contactName" | "contactPhone", string>
>;

const input =
  "mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 text-lg focus-visible:outline-tabela";

function Text({
  name,
  label,
  hint,
  defaultValue,
  error,
  autoComplete,
  inputMode,
  type = "text",
}: {
  name: CheckoutField;
  label: string;
  hint?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel";
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="ui">
        {label}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="text-soluk">
          {hint}
        </p>
      ) : null}
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={[hint ? `${name}-hint` : "", error ? `${name}-err` : ""].filter(Boolean).join(" ") || undefined}
        className={input}
      />
      {error ? (
        <p id={`${name}-err`} className="mt-1 text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({ slug, defaults }: { slug: string; defaults: CompanyDefaults }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout, {});

  if (state.checkoutFormContent) return <IyzicoForm html={state.checkoutFormContent} />;

  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="slug" value={slug} />

      <fieldset className="space-y-6">
        <legend className="ui mb-4 text-2xl">Firma bilgileri</legend>
        <Text name="legalName" label="Firma unvanı" defaultValue={defaults.legalName} error={e.legalName} autoComplete="organization" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Text name="taxOffice" label="Vergi dairesi" defaultValue={defaults.taxOffice} error={e.taxOffice} />
          <Text name="taxNumber" label="Vergi no / T.C. kimlik no" defaultValue={defaults.taxNumber} error={e.taxNumber} inputMode="numeric" />
        </div>
        <Text name="address" label="Açık adres" defaultValue={defaults.address} error={e.address} autoComplete="street-address" />
        <Text name="city" label="İl" defaultValue={defaults.city} error={e.city} autoComplete="address-level1" />
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="ui mb-4 text-2xl">Yetkili kişi</legend>
        <Text name="contactName" label="Ad soyad" defaultValue={defaults.contactName} error={e.contactName} autoComplete="name" />
        <Text name="contactPhone" label="Cep telefonu" defaultValue={defaults.contactPhone} error={e.contactPhone} autoComplete="tel" inputMode="tel" type="tel" />
        <Text
          name="identityNumber"
          label="Yetkilinin T.C. kimlik numarası"
          hint="Ödeme altyapısı (iyzico) istiyor. Bizde saklanmaz."
          error={e.identityNumber}
          inputMode="numeric"
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="ui mb-4 text-2xl">Onaylar</legend>
        {AGREEMENTS.map((a) => (
          <div key={a.type}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name={a.type}
                aria-invalid={!!e[a.type]}
                className="mt-1.5 h-5 w-5 shrink-0 accent-emaye"
              />
              <span>
                <Link href={a.href} target="_blank" className="underline underline-offset-4">
                  {a.label}
                </Link>{" "}
                okudum, onaylıyorum.
              </span>
            </label>
            {e[a.type] ? <p className="ml-8 mt-1 text-red-800">{e[a.type]}</p> : null}
          </div>
        ))}
      </fieldset>

      {state.message ? (
        <p role="alert" className="border-2 border-red-800 p-4 text-red-800">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Ödeme formu hazırlanıyor" : "Ödemeye geç"}
      </button>
    </form>
  );
}
