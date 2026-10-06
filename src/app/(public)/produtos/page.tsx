import type { Metadata } from 'next';
import { CategoryList } from '@/components/catalog/category-card';
import { ProductGrid } from '@/components/catalog/product-grid';
import { listCategories } from '@/lib/services/category.service';
import { listProducts } from '@/lib/services/product.service';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Todas as semijoias do catálogo.',
  alternates: { canonical: '/produtos' },
};

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-center font-serif text-3xl sm:text-4xl">Produtos</h1>
      <div className="mb-10">
        <CategoryList categories={categories.filter((c) => c.active)} />
      </div>
      <ProductGrid products={products.filter((p) => p.active)} />
    </div>
  );
}
