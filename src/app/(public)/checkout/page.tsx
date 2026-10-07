import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/checkout-form';

export const metadata: Metadata = { title: 'Finalizar pedido', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 font-serif text-3xl sm:text-4xl">Finalizar pedido</h1>
      <CheckoutForm />
    </div>
  );
}
