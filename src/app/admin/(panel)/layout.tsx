import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { logoutAction } from '@/lib/actions/auth.actions';
import { requireAdminPage } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminPage();
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold">Painel</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-neutral-500 sm:inline">{user.email}</span>
            <form action={logoutAction}>
              <button className="underline">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[180px_1fr]">
        <AdminNav />
        <main>{children}</main>
      </div>
    </div>
  );
}
