"use client";

import { useActionState } from "react";
import { STAGE_OPTIONS } from "@/lib/validation/admin";
import { changeProjectStage, uploadInvoice, type InvoiceState, type StageState } from "./actions";

const box = "mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 focus-visible:outline-tabela";

export function StageForm({
  companyId, stage, notes, previewUrl,
}: {
  companyId: string; stage: string; notes: string; previewUrl: string;
}) {
  const [state, action, pending] = useActionState<StageState, FormData>(changeProjectStage.bind(null, companyId), {});
  const e = state.errors ?? {};

  return (
    <form key={state.version ?? 0} action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="stage" className="ui">Aşama</label>
        <select id="stage" name="stage" defaultValue={stage} aria-invalid={!!e.stage} aria-describedby={e.stage ? "stage-err" : undefined} className={box}>
          {STAGE_OPTIONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {e.stage ? <p id="stage-err" className="mt-1 text-red-800">{e.stage}</p> : null}
      </div>
      <div>
        <label htmlFor="description" className="ui">Müşteriye görünen geçmiş satırı</label>
        <p className="text-soluk">Boş bırakırsanız aşamaya uygun hazır metin yazılır.</p>
        <textarea id="description" name="description" rows={2} aria-invalid={!!e.description} className={box} />
        {e.description ? <p className="mt-1 text-red-800">{e.description}</p> : null}
      </div>
      <div>
        <label htmlFor="notes" className="ui">Müşteriye görünen not</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={notes} aria-invalid={!!e.notes} className={box} />
        {e.notes ? <p className="mt-1 text-red-800">{e.notes}</p> : null}
      </div>
      <div>
        <label htmlFor="previewUrl" className="ui">Önizleme adresi</label>
        <input id="previewUrl" name="previewUrl" defaultValue={previewUrl} aria-invalid={!!e.previewUrl} aria-describedby={e.previewUrl ? "previewUrl-err" : undefined} className={box} />
        {e.previewUrl ? <p id="previewUrl-err" className="mt-1 text-red-800">{e.previewUrl}</p> : null}
      </div>
      {state.message ? <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-emaye" : "text-red-800"}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep disabled:opacity-60">
        {pending ? "Kaydediliyor" : "Kaydet"}
      </button>
    </form>
  );
}

export function InvoiceForm({ paymentId }: { paymentId: string }) {
  const [state, action, pending] = useActionState<InvoiceState, FormData>(uploadInvoice.bind(null, paymentId), {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <label htmlFor={`inv-${paymentId}`} className="sr-only">Fatura PDF</label>
      <input id={`inv-${paymentId}`} name="file" type="file" required accept="application/pdf" className="max-w-48 text-sm" />
      <button type="submit" disabled={pending} className="ui border-2 border-murekkep px-3 py-1 text-sm disabled:opacity-60">
        {pending ? "Yükleniyor" : "Yükle"}
      </button>
      {state.message ? <span role={state.ok ? "status" : "alert"} className={state.ok ? "text-emaye" : "text-red-800"}>{state.message}</span> : null}
    </form>
  );
}
