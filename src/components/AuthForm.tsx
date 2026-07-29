"use client";

import { useActionState } from "react";
import type { AuthActionState } from "@/app/actions/auth";

type Field = {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
};

export function AuthForm({
  action,
  fields,
  submitLabel,
}: {
  action: (prevState: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-neutral-700">{field.label}</span>
          <input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </label>
      ))}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-rose-600 px-4 py-2 font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
      >
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}
