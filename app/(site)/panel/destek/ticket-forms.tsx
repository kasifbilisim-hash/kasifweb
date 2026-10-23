"use client";

import { useActionState } from "react";
import { submitClass } from "@/components/auth/auth-shell";
import { TICKET_CATEGORIES } from "@/lib/validation/panel";
import { createTicket, replyToTicket, type TicketState } from "./actions";

const box = "mt-2 w-full border-2 border-murekkep bg-duvar px-4 py-3 text-lg focus-visible:outline-tabela";

function FieldError({ id, text }: { id: string; text?: string }) {
  return text ? <p id={`${id}-err`} className="mt-1 text-red-800">{text}</p> : null;
}

function FileField({ error }: { error?: string }) {
  return (
    <div>
      <label htmlFor="file" className="ui">Ek dosya</label>
      <p id="file-hint" className="text-soluk">İsteğe bağlı. PDF, JPG, PNG veya WEBP, en fazla 3,5 MB.</p>
      <input
        id="file"
        name="file"
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        aria-describedby={error ? "file-hint file-err" : "file-hint"}
        aria-invalid={!!error}
        className="mt-2 block w-full border-2 border-murekkep bg-duvar p-3"
      />
      <FieldError id="file" text={error} />
    </div>
  );
}

export function NewTicketForm() {
  const [state, action, pending] = useActionState<TicketState, FormData>(createTicket, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};

  return (
    <form key={state.version ?? 0} action={action} className="space-y-6" noValidate>
      <div>
        <label htmlFor="category" className="ui">Kategori</label>
        <select id="category" name="category" defaultValue={v.category ?? ""} aria-invalid={!!e.category} aria-describedby={e.category ? "category-err" : undefined} className={box}>
          <option value="" disabled>Seçin</option>
          {Object.entries(TICKET_CATEGORIES).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <FieldError id="category" text={e.category} />
      </div>
      <div>
        <label htmlFor="subject" className="ui">Konu</label>
        <input id="subject" name="subject" type="text" defaultValue={v.subject ?? ""} aria-invalid={!!e.subject} aria-describedby={e.subject ? "subject-err" : undefined} className={box} />
        <FieldError id="subject" text={e.subject} />
      </div>
      <div>
        <label htmlFor="message" className="ui">Mesajınız</label>
        <textarea id="message" name="message" rows={6} defaultValue={v.message ?? ""} aria-invalid={!!e.message} aria-describedby={e.message ? "message-err" : undefined} className={box} />
        <FieldError id="message" text={e.message} />
      </div>
      <FileField error={e.file} />
      {state.message ? <p role="alert" className="text-red-800">{state.message}</p> : null}
      <button type="submit" disabled={pending} className={submitClass}>{pending ? "Gönderiliyor" : "Talebi gönder"}</button>
    </form>
  );
}

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState<TicketState, FormData>(replyToTicket.bind(null, ticketId), {});
  const e = state.errors ?? {};

  return (
    <form key={state.version ?? 0} action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="message" className="ui">Yanıtınız</label>
        <textarea id="message" name="message" rows={5} defaultValue={state.values?.message ?? ""} aria-invalid={!!e.message} aria-describedby={e.message ? "message-err" : undefined} className={box} />
        <FieldError id="message" text={e.message} />
      </div>
      <FileField error={e.file} />
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-emaye" : "text-red-800"}>{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className={submitClass}>{pending ? "Gönderiliyor" : "Gönder"}</button>
    </form>
  );
}
