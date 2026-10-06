import type { ProductWithCategory } from '@/lib/services/product.service';
import { ProductCard } from './product-card';

export function ProductGrid({
  products,
  emptyMessage = 'Nenhum produto disponível no momento.',
}: {
  products: ProductWithCategory[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-neutral-500">{emptyMessage}</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
