import Link from 'next/link';
import { UpdateOrderStatusForm } from '@/components/admin/update-order-status-form';
import { formatBRL } from '@/lib/format/currency';
import { STATUS_LABELS } from '@/lib/format/order-status';
import { formatBrazilPhone } from '@/lib/format/phone';
import { listOrders } from '@/lib/services/order.service';
import { ORDER_STATUSES } from '@/lib/validations/catalog';
import type { OrderStatus } from '@/types/database.types';

export const metadata = { title: 'Pedidos' };

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status = ORDER_STATUSES.includes(raw as OrderStatus) ? (raw as OrderStatus) : undefined;
  const orders = await listOrders({ status });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Pedidos</h1>
      <nav aria-label="Filtrar por status" className="flex flex-wrap gap-2 text-sm">
        {[undefined, ...ORDER_STATUSES].map((s) => (
          <Link
            key={s ?? 'all'}
            href={s ? `/admin/pedidos?status=${s}` : '/admin/pedidos'}
            aria-current={s === status ? 'page' : undefined}
            className={`rounded-full px-3 py-1 ${s === status ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-200'}`}
          >
            {s ? STATUS_LABELS[s] : 'Todos'}
          </Link>
        ))}
      </nav>
      {orders.length === 0 && <p className="text-neutral-500">Nenhum pedido.</p>}
      <ul className="flex flex-col gap-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  Pedido #{o.order_number}{' '}
                  <span className="font-normal text-neutral-500">
                    · {dateFmt.format(new Date(o.created_at))}
                  </span>
                </p>
                <p className="text-sm text-neutral-600">
                  {o.customer_name} ·{' '}
                  <a
                    className="underline"
                    href={`https://wa.me/55${o.customer_phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formatBrazilPhone(o.customer_phone)}
                  </a>
                </p>
              </div>
              <UpdateOrderStatusForm id={o.id} status={o.status} />
            </div>
            <ul className="mt-3 border-t pt-3 text-sm">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span>
                    {i.quantity}× {i.product_name}{' '}
                    <span className="text-neutral-500">({formatBRL(i.unit_price)})</span>
                  </span>
                  <span className="tabular-nums">{formatBRL(i.subtotal)}</span>
                </li>
              ))}
            </ul>
            {o.customer_note && (
              <p className="mt-2 text-sm text-neutral-600">Obs.: {o.customer_note}</p>
            )}
            <p className="mt-2 text-right font-semibold tabular-nums">
              Total {formatBRL(o.total_amount)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
