"use client";

import { useActionState } from "react";
import { submitClass } from "@/components/auth/auth-shell";
import { uploadSignedCommitment, type UploadState } from "./actions";

export function UploadForm({ replacing }: { replacing: boolean }) {
  const [state, action, pending] = useActionState<UploadState, FormData>(uploadSignedCommitment, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="file" className="ui">
          {replacing ? "Yeni dosyayı seçin" : "Kaşeli ve imzalı nüsha"}
        </label>
        <p id="file-hint" className="text-soluk">
          PDF, JPG, PNG veya WEBP. En fazla 3,5 MB.
        </p>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept="application/pdf,image/jpeg,image/png,image/webp"
          aria-describedby="file-hint"
          className="mt-2 block w-full border-2 border-murekkep bg-duvar p-3"
        />
      </div>
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-emaye" : "text-red-800"}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Yükleniyor" : replacing ? "Yeniden yükle" : "Yükle"}
      </button>
    </form>
  );
}
