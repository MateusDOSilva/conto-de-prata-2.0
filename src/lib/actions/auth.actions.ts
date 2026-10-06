'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from './action-result';

const LoginSchema = z.object({
  email: z.email('E-mail inválido').max(254),
  password: z.string().min(1, 'Informe a senha').max(200),
});

export async function loginAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  // Mensagem genérica: não revela se o e-mail existe.
  if (!parsed.success) return { ok: false, message: 'E-mail ou senha inválidos.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: 'E-mail ou senha inválidos.' };

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
