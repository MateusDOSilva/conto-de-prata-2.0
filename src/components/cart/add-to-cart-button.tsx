'use client';

import { useState } from 'react';
import { useCart, type CartItem } from '@/hooks/use-cart';
import { MAX_QUANTITY_PER_PRODUCT } from '@/lib/validations/order';

export function AddToCartButton({
  product,
  compact = false,
}: {
  product: Omit<CartItem, 'quantity'>;
  compact?: boolean;
}) {
  const { add, quantityOf, hydrated } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);
  const inCart = quantityOf(product.product_id);
  const atLimit = inCart >= MAX_QUANTITY_PER_PRODUCT;

  function handleClick() {
    if (atLimit) return;
    add(product, 1);
    setFeedback('Adicionado ao carrinho');
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={!hydrated || atLimit}
        className={`w-full rounded-full bg-[var(--color-secondary)] font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'px-3 py-2 text-xs' : 'px-6 py-3 text-sm'}`}
      >
        {atLimit ? `Limite de ${MAX_QUANTITY_PER_PRODUCT} unidades` : 'Adicionar ao carrinho'}
      </button>
      <p
        role="status"
        aria-live="polite"
        className="mt-1 min-h-4 text-center text-xs text-green-700"
      >
        {feedback ?? (inCart > 0 && !atLimit ? `${inCart} no carrinho` : '')}
      </p>
    </div>
  );
}
