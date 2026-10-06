import type { z } from 'zod';

export type ActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues)
    (out[String(issue.path[0] ?? 'form')] ??= []).push(issue.message);
  return out;
}
