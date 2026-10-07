'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';

export function CartLink() {
  const { totalQuantity, hydrated } = useCart();
  const label = hydrated && totalQuantity > 0 ? `Carrinho, ${totalQuantity} itens` : 'Carrinho';
  return (
    <Link
      href="/carrinho"
      aria-label={label}
      className="relative flex items-center gap-2 rounded-full px-3 py-2 hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span className="hidden sm:inline">Carrinho</span>
      {hydrated && totalQuantity > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}
