'use client';

import { useFormStatus } from 'react-dom';
import type { ActionState } from '@/lib/actions/action-result';

export const inputClass =
  'mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10';

export function SubmitButton({
  children,
  pendingText = 'Salvando…',
}: {
  children: React.ReactNode;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function Field({
  label,
  name,
  state,
  hint,
  children,
}: {
  label: string;
  name: string;
  state?: ActionState;
  hint?: string;
  children: React.ReactNode;
}) {
  const error = state?.fieldErrors?.[name]?.[0];
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-neutral-800">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? 'status' : 'alert'}
      className={`rounded-lg p-3 text-sm ${state.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}
    >
      {state.message}
    </p>
  );
}
