"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "./actions";

const initial: ContactState = { ok: false };

const field =
  "mt-2 w-full border-2 border-murekkep bg-beyaz px-4 py-3 text-lg focus-visible:outline-tabela";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);

  if (state.ok) {
    return (
      <p role="status" className="levha bg-tabela p-6 text-lg">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="ui">
          Adınız
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={!!state.errors?.name}
          aria-describedby={state.errors?.name ? "name-err" : undefined}
          className={field}
        />
        {state.errors?.name && (
          <p id="name-err" className="mt-1 text-red-800">
            {state.errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="ui">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!state.errors?.email}
          aria-describedby={state.errors?.email ? "email-err" : undefined}
          className={field}
        />
        {state.errors?.email && (
          <p id="email-err" className="mt-1 text-red-800">
            {state.errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="message" className="ui">
          Mesajınız
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={!!state.errors?.message}
          aria-describedby={state.errors?.message ? "message-err" : undefined}
          className={field}
        />
        {state.errors?.message && (
          <p id="message-err" className="mt-1 text-red-800">
            {state.errors.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="ui bg-emaye px-7 py-4 text-lg text-beyaz hover:bg-murekkep disabled:opacity-60"
      >
        {pending ? "Gönderiliyor" : "Mesajı gönder"}
      </button>
    </form>
  );
}
