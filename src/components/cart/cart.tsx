'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { getCartProductsAction } from '@/lib/actions/cart.actions';
import { formatBRL } from '@/lib/format/currency';
import { CartItem } from './cart-item';

export function Cart() {
  const { items, hydrated, estimatedTotal, setQuantity, remove, sync } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const synced = useRef(false);

  // Ao abrir o carrinho, atualiza nome/preço e remove produtos que saíram do catálogo.
  useEffect(() => {
    if (!hydrated || synced.current || items.length === 0) return;
    synced.current = true;
    const before = items.length;
    getCartProductsAction(items.map((i) => i.product_id)).then((products) => {
      sync(products);
      if (products.length < before)
        setNotice('Alguns produtos não estão mais disponíveis e foram removidos.');
    });
  }, [hydrated, items, sync]);

  if (!hydrated) return <p className="py-16 text-center text-current/60">Carregando carrinho…</p>;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-current/70">Seu carrinho está vazio.</p>
        <Link
          href="/produtos"
          className="mt-6 inline-block rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        {notice && (
          <p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            {notice}
          </p>
        )}
        <ul className="divide-y divide-current/10">
          {items.map((item) => (
            <CartItem
              key={item.product_id}
              item={item}
              onQuantityChange={(q) => setQuantity(item.product_id, q)}
              onRemove={() => remove(item.product_id)}
            />
          ))}
        </ul>
      </div>
      <aside className="h-fit rounded-2xl border border-current/10 p-6">
        <div className="flex justify-between text-lg">
          <span>Total estimado</span>
          <span className="font-medium">{formatBRL(estimatedTotal)}</span>
        </div>
        <p className="mt-2 text-xs text-current/60">
          O valor final é confirmado pela loja com os preços vigentes no momento do pedido.
        </p>
        <Link
          href="/checkout"
          className="mt-6 block rounded-full bg-[var(--color-primary)] px-6 py-3 text-center text-sm font-medium text-white transition hover:brightness-110"
        >
          Continuar para o checkout
        </Link>
      </aside>
    </div>
  );
}
