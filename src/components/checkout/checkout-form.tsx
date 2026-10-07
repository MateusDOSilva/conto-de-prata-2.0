'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useCart } from '@/hooks/use-cart';
import { createOrderAction, type CreateOrderActionResult } from '@/lib/actions/order.actions';
import { formatBRL } from '@/lib/format/currency';

type Success = Extract<CreateOrderActionResult, { ok: true }>;

export function CheckoutForm() {
  const { items, hydrated, estimatedTotal, checkoutKey, ensureCheckoutKey, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<Success | null>(null);

  // A mesma chave é reutilizada em retries/refresh até o pedido ser concluído.
  useEffect(() => {
    if (hydrated && items.length > 0) ensureCheckoutKey();
  }, [hydrated, items.length, ensureCheckoutKey]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || !checkoutKey) return;
    const form = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createOrderAction({
        customer_name: form.get('customer_name'),
        customer_phone: form.get('customer_phone'),
        customer_note: form.get('customer_note') || undefined,
        website: form.get('website'),
        idempotency_key: checkoutKey,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setSuccess(result);
      clear();
      window.location.href = result.whatsappUrl;
    });
  }

  if (success) {
    return (
      <div role="status" className="mx-auto max-w-md py-12 text-center">
        <p className="font-serif text-3xl">Pedido #{success.orderNumber} registrado!</p>
        <p className="mt-3 text-current/70">
          Total: <strong>{formatBRL(success.totalAmount)}</strong>. Estamos abrindo o WhatsApp para
          você enviar o pedido à loja.
        </p>
        <a
          href={success.whatsappUrl}
          className="mt-8 inline-block rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white"
        >
          Abrir WhatsApp
        </a>
        <p className="mt-6">
          <Link href="/produtos" className="text-sm underline">
            Voltar ao catálogo
          </Link>
        </p>
      </div>
    );
  }

  if (!hydrated) return <p className="py-16 text-center text-current/60">Carregando…</p>;
  if (items.length === 0) {
    return (
      <p className="py-16 text-center">
        Seu carrinho está vazio.{' '}
        <Link href="/produtos" className="underline">
          Ver produtos
        </Link>
      </p>
    );
  }

  const input =
    'mt-1 w-full rounded-xl border border-current/20 bg-white/70 px-4 py-3 text-base focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]/30';
  const fieldError = (name: string) =>
    fieldErrors[name]?.[0] && (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
        {fieldErrors[name][0]}
      </p>
    );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" aria-busy={pending}>
        <div>
          <label htmlFor="customer_name" className="text-sm font-medium">
            Nome
          </label>
          <input
            id="customer_name"
            name="customer_name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className={input}
            aria-invalid={!!fieldErrors.customer_name}
            aria-describedby={fieldErrors.customer_name ? 'customer_name-error' : undefined}
          />
          {fieldError('customer_name')}
        </div>
        <div>
          <label htmlFor="customer_phone" className="text-sm font-medium">
            Telefone / WhatsApp
          </label>
          <input
            id="customer_phone"
            name="customer_phone"
            type="tel"
            inputMode="tel"
            required
            placeholder="(21) 99999-9999"
            autoComplete="tel-national"
            className={input}
            aria-invalid={!!fieldErrors.customer_phone}
            aria-describedby={fieldErrors.customer_phone ? 'customer_phone-error' : undefined}
          />
          {fieldError('customer_phone')}
        </div>
        <div>
          <label htmlFor="customer_note" className="text-sm font-medium">
            Observação <span className="font-normal text-current/60">(opcional)</span>
          </label>
          <textarea
            id="customer_note"
            name="customer_note"
            rows={3}
            maxLength={500}
            className={input}
            aria-invalid={!!fieldErrors.customer_note}
            aria-describedby={fieldErrors.customer_note ? 'customer_note-error' : undefined}
          />
          {fieldError('customer_note')}
        </div>
        {/* honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label htmlFor="website">Não preencha</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {error}{' '}
            {(fieldErrors.items || error.includes('carrinho')) && (
              <Link href="/carrinho" className="underline">
                Revisar carrinho
              </Link>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !checkoutKey}
          className="rounded-full bg-[var(--color-primary)] px-6 py-4 text-base font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
        >
          {pending ? 'Registrando pedido…' : 'Finalizar pedido'}
        </button>
        <p className="text-xs text-current/60">
          Ao finalizar, seu pedido é registrado e você será direcionado ao WhatsApp da loja.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-current/10 p-6"
        aria-label="Resumo do pedido"
      >
        <h2 className="font-serif text-xl">Resumo</h2>
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.product_id} className="flex justify-between gap-2">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span className="whitespace-nowrap">{formatBRL(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-current/10 pt-4 font-medium">
          <span>Total estimado</span>
          <span>{formatBRL(estimatedTotal)}</span>
        </div>
      </aside>
    </div>
  );
}
