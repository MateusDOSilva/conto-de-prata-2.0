import type { Metadata } from 'next';
import { Cart } from '@/components/cart/cart';

export const metadata: Metadata = { title: 'Carrinho', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 font-serif text-3xl sm:text-4xl">Carrinho</h1>
      <Cart />
    </div>
  );
}
