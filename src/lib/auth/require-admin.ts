import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export class ForbiddenError extends Error {
  constructor() {
    super('Acesso restrito a administradores');
  }
}

/** Retorna o usuário admin ou null. Usa getUser() (valida o JWT no Supabase). */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false } as const;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return { user, isAdmin: profile?.role === 'admin' } as const;
}

/** Para páginas/layouts: redireciona quem não está logado; 403 para não-admin. */
export async function requireAdminPage() {
  const { user, isAdmin } = await getAdminUser();
  if (!user) redirect('/admin/login');
  if (!isAdmin) redirect('/admin/sem-permissao');
  return user;
}

/** Para Server Actions (endpoints POST públicos): lança erro se não for admin. */
export async function requireAdmin() {
  const { user, isAdmin } = await getAdminUser();
  if (!user || !isAdmin) throw new ForbiddenError();
  return user;
}
