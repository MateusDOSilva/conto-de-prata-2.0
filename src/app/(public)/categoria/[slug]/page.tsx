import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/product-grid';
import { getCategoryBySlug } from '@/lib/services/category.service';
import { listProducts } from '@/lib/services/product.service';
import { SlugSchema } from '@/lib/validations/catalog';

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const parsed = SlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  return getCategoryBySlug(parsed.data);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await load(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `Explore ${category.name.toLowerCase()} e acessórios da nossa coleção. Encontre uma peça para contar a sua história na Conto de Pratas.`,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      type: 'website',
      title: `${category.name} | Conto de Pratas`,
      description: `Explore ${category.name.toLowerCase()} e acessórios da Conto de Pratas.`,
      url: `/categoria/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await load(slug);
  if (!category) notFound();
  const products = (await listProducts({ categoryId: category.id })).filter((p) => p.active);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-10 text-center font-serif text-3xl sm:text-4xl">{category.name}</h1>
      <ProductGrid
        products={products}
        emptyMessage="Nenhum produto nesta categoria por enquanto."
      />
    </div>
  );
}
