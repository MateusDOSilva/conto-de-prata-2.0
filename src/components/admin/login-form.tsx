'use client';

import { useActionState } from 'react';
import { loginAction } from '@/lib/actions/auth.actions';
import { Field, FormMessage, inputClass, SubmitButton } from './ui';

export function LoginForm() {
  const [state, action] = useActionState(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="E-mail" name="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Field>
      <Field label="Senha" name="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
