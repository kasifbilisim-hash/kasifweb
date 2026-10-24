"use client";

import { useActionState } from "react";
import { submitClass } from "@/components/auth/auth-shell";
import { respondToPreview, type PreviewState } from "./actions";

export function PreviewForm() {
  const [state, action, pending] = useActionState<PreviewState, FormData>(respondToPreview, {});
  const err = state.errors?.note;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="note" className="ui">Revizyon istiyorsanız neyin değişmesi gerektiğini yazın</label>
        <textarea
          key={state.note ?? ""}
          id="note"
          name="note"
          rows={4}
          defaultValue={state.note ?? ""}
          aria-invalid={!!err}
          aria-describedby={err ? "note-err" : undefined}
          className="mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 text-lg focus-visible:outline-tabela"
        />
        {err ? <p id="note-err" className="mt-1 text-red-800">{err}</p> : null}
      </div>
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-emaye" : "text-red-800"}>{state.message}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" name="intent" value="approve" disabled={pending} className={submitClass}>
          Onayla
        </button>
        <button type="submit" name="intent" value="revision" disabled={pending} className="ui border-2 border-murekkep px-7 py-4 text-lg disabled:opacity-60">
          Revizyon iste
        </button>
      </div>
      <p className="text-soluk">Onayladığınızda geliştirmeye geçeriz. Revizyon isterseniz tasarım aşamasına döneriz.</p>
    </form>
  );
}
