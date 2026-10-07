import { ProductForm } from '@/components/admin/product-form';
import { listCategories } from '@/lib/services/category.service';

export const metadata = { title: 'Novo produto' };

export default async function NewProductPage() {
  const categories = await listCategories();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
