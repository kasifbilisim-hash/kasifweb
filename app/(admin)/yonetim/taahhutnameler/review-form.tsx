"use client";

import { useActionState } from "react";
import { reviewCommitment, type ReviewState } from "./actions";

export function ReviewForm({ docId }: { docId: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(reviewCommitment.bind(null, docId), {});
  const id = `reason-${docId}`;

  if (state.ok) return <p role="status" className="text-emaye">{state.message}</p>;

  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor={id} className="ui">Red nedeni (yalnızca reddederken)</label>
        <textarea
          id={id}
          name="reason"
          rows={3}
          defaultValue={state.reason ?? ""}
          aria-invalid={!!state.error}
          aria-describedby={state.error ? `${id}-err` : undefined}
          className="mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 focus-visible:outline-tabela"
        />
        {state.error ? <p id={`${id}-err`} className="mt-1 text-red-800">{state.error}</p> : null}
      </div>
      {state.message ? <p role="alert" className="text-red-800">{state.message}</p> : null}
      <div className="flex flex-wrap gap-4">
        <button type="submit" name="intent" value="approve" disabled={pending} className="ui bg-emaye px-6 py-3 text-beyaz hover:bg-murekkep disabled:opacity-60">
          Onayla
        </button>
        <button type="submit" name="intent" value="reject" disabled={pending} className="ui border-2 border-red-800 px-6 py-3 text-red-800 disabled:opacity-60">
          Reddet
        </button>
      </div>
    </form>
  );
}
