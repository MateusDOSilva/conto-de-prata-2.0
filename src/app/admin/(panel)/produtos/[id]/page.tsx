import { notFound } from 'next/navigation';
import { z } from 'zod';
import { ProductForm } from '@/components/admin/product-form';
import { listCategories } from '@/lib/services/category.service';
import { getProductById } from '@/lib/services/product.service';

export const metadata = { title: 'Editar produto' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [product, categories] = await Promise.all([getProductById(id), listCategories()]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Editar produto</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
