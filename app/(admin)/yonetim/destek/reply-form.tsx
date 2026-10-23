"use client";

import { useActionState } from "react";
import { replyAsAdmin, type AdminTicketState } from "./actions";

export function AdminReplyForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState<AdminTicketState, FormData>(replyAsAdmin.bind(null, ticketId), {});

  return (
    <form key={state.version ?? 0} action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="message" className="ui">Yanıt</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={state.text ?? ""}
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "message-err" : undefined}
          className="mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 text-lg focus-visible:outline-tabela"
        />
        {state.error ? <p id="message-err" className="mt-1 text-red-800">{state.error}</p> : null}
      </div>
      <div>
        <label htmlFor="file" className="ui">Ek dosya (isteğe bağlı)</label>
        <input id="file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="mt-2 block w-full border-2 border-murekkep bg-duvar p-3" />
      </div>
      {state.message ? <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-emaye" : "text-red-800"}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="ui bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep disabled:opacity-60">
        {pending ? "Gönderiliyor" : "Yanıtla"}
      </button>
    </form>
  );
}
