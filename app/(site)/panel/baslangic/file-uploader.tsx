"use client";

import { useId, useState, useTransition } from "react";
import type { FileRef } from "@/lib/validation/onboarding";
import { uploadOnboardingFile } from "./actions";

/** Dosyayı seçer seçmez yükler; formun gönderdiği değer dosya referanslarının JSON'ıdır. */
export function FileUploader({
  name,
  label,
  hint,
  max,
  initial,
  disabled,
}: {
  name: string;
  label: string;
  hint: string;
  max: number;
  initial: FileRef[];
  disabled?: boolean;
}) {
  const inputId = useId();
  const [files, setFiles] = useState<FileRef[]>(initial);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError(undefined);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadOnboardingFile(fd);
      if (res.ok) setFiles((prev) => [...prev, res.file].slice(0, max));
      else setError(res.error);
      input.value = "";
    });
  }

  const value = max === 1 ? JSON.stringify(files[0] ?? null) : JSON.stringify(files);

  return (
    <div>
      <label htmlFor={inputId} className="ui">
        {label}
      </label>
      <p id={`${inputId}-hint`} className="text-soluk">
        {hint}
      </p>
      <input type="hidden" name={name} value={value} />
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f.path} className="flex items-center justify-between gap-4 border-2 border-murekkep px-3 py-2">
              <span className="truncate">{f.name}</span>
              {disabled ? null : (
                <button
                  type="button"
                  className="ui shrink-0 underline underline-offset-4"
                  onClick={() => setFiles((prev) => prev.filter((x) => x.path !== f.path))}
                  aria-label={`${f.name} dosyasını kaldır`}
                >
                  Kaldır
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!disabled && files.length < max && (
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPick}
          disabled={pending}
          aria-describedby={`${inputId}-hint`}
          className="mt-2 block w-full border-2 border-murekkep bg-duvar p-3"
        />
      )}
      {pending ? <p role="status">Yükleniyor</p> : null}
      {error ? (
        <p role="alert" className="mt-1 text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
