import type { Metadata } from 'next';
import { logoutAction } from '@/lib/actions/auth.actions';

export const metadata: Metadata = {
  title: 'Sem permissão',
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sua conta não tem permissão de administrador.
        </p>
        <form action={logoutAction} className="mt-6">
          <button className="text-sm underline">Sair</button>
        </form>
      </div>
    </main>
  );
}
