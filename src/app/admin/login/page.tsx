import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { getAdminUser } from '@/lib/auth/require-admin';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false, follow: false } };

export default async function LoginPage() {
  const { isAdmin } = await getAdminUser();
  if (isAdmin) redirect('/admin/dashboard');
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold">Painel administrativo</h1>
        <LoginForm />
      </div>
    </main>
  );
}
