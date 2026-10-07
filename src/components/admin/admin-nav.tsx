'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/pedidos', 'Pedidos'],
  ['/admin/produtos', 'Produtos'],
  ['/admin/categorias', 'Categorias'],
  ['/admin/configuracoes', 'Configurações'],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administração" className="flex gap-1 overflow-x-auto text-sm md:flex-col">
      {LINKS.map(([href, label]) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-lg px-3 py-2 whitespace-nowrap ${active ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-200'}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
