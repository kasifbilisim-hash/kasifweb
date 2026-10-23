"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitClass } from "@/components/auth/auth-shell";
import { requestCancellation, type CancelState } from "./actions";

export function CancelForm() {
  const [state, action, pending] = useActionState<CancelState, FormData>(requestCancellation, {});
  const e = state.errors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="levha bg-tabela p-6">
        <p className="ui text-xl">İptal talebiniz ekibimize iletildi.</p>
        <p className="mt-2">Değerlendirip size panelden dönüş yapacağız. Onaylanana kadar hizmetiniz ve aylık çekim sürer. Alan adınız sizde kalır.</p>
        <p className="mt-4">
          <Link href="/panel/destek" className="underline underline-offset-4">Talebimi gör</Link>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      <div>
        <label htmlFor="reason" className="ui">İptal nedeniniz</label>
        <p id="reason-hint" className="text-soluk">Neyden memnun kalmadığınızı yazın. Zorunlu.</p>
        <textarea
          id="reason"
          name="reason"
          rows={6}
          defaultValue={state.reason ?? ""}
          aria-invalid={!!e.reason}
          aria-describedby={e.reason ? "reason-hint reason-err" : "reason-hint"}
          className="mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 text-lg focus-visible:outline-tabela"
        />
        {e.reason ? <p id="reason-err" className="mt-1 text-red-800">{e.reason}</p> : null}
      </div>
      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="confirm" aria-invalid={!!e.confirm} aria-describedby={e.confirm ? "confirm-err" : undefined} className="mt-1 h-5 w-5 accent-emaye" />
          <span>İptal talebinin hemen iptal anlamına gelmediğini, ekibin değerlendirmesi sonrası kesinleşeceğini anladım.</span>
        </label>
        {e.confirm ? <p id="confirm-err" className="mt-1 text-red-800">{e.confirm}</p> : null}
      </div>
      {state.message ? <p role="alert" className="text-red-800">{state.message}</p> : null}
      <button type="submit" disabled={pending} className={submitClass}>{pending ? "Gönderiliyor" : "İptal talebi gönder"}</button>
    </form>
  );
}
