import Link from 'next/link';
import { listProducts } from '@/lib/services/product.service';
import { getOrderStats } from '@/lib/services/order.service';
import { STATUS_LABELS } from '@/lib/format/order-status';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const [stats, products] = await Promise.all([getOrderStats(), listProducts()]);
  const cards = [
    ...Object.entries(stats).map(([status, count]) => ({
      label: `Pedidos ${STATUS_LABELS[status as keyof typeof STATUS_LABELS].toLowerCase()}`,
      value: count,
      href: `/admin/pedidos?status=${status}`,
    })),
    {
      label: 'Produtos ativos',
      value: products.filter((p) => p.active).length,
      href: '/admin/produtos',
    },
  ];
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl bg-white p-5 shadow-sm hover:shadow"
          >
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
