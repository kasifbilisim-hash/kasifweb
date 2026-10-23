"use client";

import { useActionState, useState } from "react";
import { approveCancellation, rejectCancellation, type CancelDecisionState } from "./actions";

type Mode = "idle" | "approve" | "reject";

export function Decision({ subId }: { subId: string }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [approveState, approve, approving] = useActionState<CancelDecisionState, FormData>(approveCancellation.bind(null, subId), {});
  const [rejectState, reject, rejecting] = useActionState<CancelDecisionState, FormData>(rejectCancellation.bind(null, subId), {});
  const done = approveState.ok ? approveState : rejectState.ok ? rejectState : null;

  if (done) return <p role="status" className="text-emaye">{done.message}</p>;

  return (
    <div className="space-y-4">
      {mode === "idle" && (
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={() => setMode("approve")} className="ui bg-murekkep px-6 py-3 text-beyaz hover:bg-emaye">
            İptali onayla
          </button>
          <button type="button" onClick={() => setMode("reject")} className="ui border-2 border-murekkep px-6 py-3">
            Talebi reddet
          </button>
        </div>
      )}

      {mode === "approve" && (
        <form action={approve} className="space-y-4 border-4 border-red-800 p-5">
          <p className="ui text-red-800">Bu işlem geri alınamaz</p>
          <p>iyzico aboneliği iptal edilir, aylık çekim durur, proje sonlandırılır. Müşteriye bilgi gider.</p>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="confirm" className="mt-1 h-5 w-5 accent-red-800" aria-describedby={approveState.error ? "approve-err" : undefined} />
            <span>Aboneliği iptal edeceğimi onaylıyorum.</span>
          </label>
          {approveState.error ? <p id="approve-err" className="text-red-800">{approveState.error}</p> : null}
          {approveState.message ? <p role="alert" className="text-red-800">{approveState.message}</p> : null}
          <div className="flex flex-wrap gap-4">
            <button type="submit" disabled={approving} className="ui bg-red-800 px-6 py-3 text-beyaz disabled:opacity-60">
              {approving ? "İptal ediliyor" : "Evet, iptal et"}
            </button>
            <button type="button" onClick={() => setMode("idle")} className="ui underline underline-offset-4">Vazgeç</button>
          </div>
        </form>
      )}

      {mode === "reject" && (
        <form action={reject} className="space-y-4 border-2 border-murekkep p-5">
          <div>
            <label htmlFor={`reject-${subId}`} className="ui">Red nedeni (müşteriye gösterilir)</label>
            <textarea
              id={`reject-${subId}`}
              name="reason"
              rows={3}
              defaultValue={rejectState.reason ?? ""}
              aria-invalid={!!rejectState.error}
              aria-describedby={rejectState.error ? `reject-${subId}-err` : undefined}
              className="mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 focus-visible:outline-tabela"
            />
            {rejectState.error ? <p id={`reject-${subId}-err`} className="mt-1 text-red-800">{rejectState.error}</p> : null}
          </div>
          {rejectState.message ? <p role="alert" className="text-red-800">{rejectState.message}</p> : null}
          <div className="flex flex-wrap gap-4">
            <button type="submit" disabled={rejecting} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep disabled:opacity-60">
              {rejecting ? "Gönderiliyor" : "Reddet"}
            </button>
            <button type="button" onClick={() => setMode("idle")} className="ui underline underline-offset-4">Vazgeç</button>
          </div>
        </form>
      )}
    </div>
  );
}
