"use client";

import { useActionState } from "react";
import { IyzicoForm } from "@/components/iyzico-form";
import { startCardUpdate, type CardUpdateState } from "./actions";

export function CardUpdate() {
  const [state, action, pending] = useActionState<CardUpdateState, FormData>(() => startCardUpdate(), {});

  if (state.checkoutFormContent) return <IyzicoForm html={state.checkoutFormContent} />;

  return (
    <form action={action} className="space-y-3">
      <button type="submit" disabled={pending} className="ui border-2 border-murekkep px-6 py-3 disabled:opacity-60">
        {pending ? "Form açılıyor" : "Kartı güncelle"}
      </button>
      {state.message ? <p role="alert" className="text-red-800">{state.message}</p> : null}
    </form>
  );
}
