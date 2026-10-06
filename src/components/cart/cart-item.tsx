'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartItem as CartItemType } from '@/hooks/use-cart';
import { formatBRL } from '@/lib/format/currency';
import { MAX_QUANTITY_PER_PRODUCT } from '@/lib/validations/order';

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const btn =
    'flex size-9 items-center justify-center rounded-full border border-current/20 text-lg transition hover:border-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:opacity-30';
  return (
    <li className="flex gap-4 py-5">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-muted)] sm:size-24">
        {item.image_url && (
          <Image src={item.image_url} alt={item.name} fill sizes="96px" className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-2">
          <Link
            href={`/produtos/${item.slug}`}
            className="font-serif text-base hover:underline sm:text-lg"
          >
            {item.name}
          </Link>
          <p className="text-sm font-medium whitespace-nowrap">
            {formatBRL(item.price * item.quantity)}
          </p>
        </div>
        <p className="text-xs text-current/60">{formatBRL(item.price)} cada</p>
        <div className="mt-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3"
            role="group"
            aria-label={`Quantidade de ${item.name}`}
          >
            <button
              type="button"
              className={btn}
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span aria-live="polite" className="w-4 text-center tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              className={btn}
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= MAX_QUANTITY_PER_PRODUCT}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-current/60 underline hover:text-red-700"
          >
            Remover
          </button>
        </div>
        {item.quantity >= MAX_QUANTITY_PER_PRODUCT && (
          <p className="text-xs text-current/60">
            Máximo de {MAX_QUANTITY_PER_PRODUCT} unidades por produto.
          </p>
        )}
      </div>
    </li>
  );
}
