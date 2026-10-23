import { inputClass } from "./auth-shell";

export function Field({
  id,
  label,
  type = "text",
  autoComplete,
  error,
  minLength,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="ui">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={inputClass}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
