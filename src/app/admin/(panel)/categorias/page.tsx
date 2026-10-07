import { CategoryForm, DeleteCategoryButton } from '@/components/admin/category-form';
import { listCategories } from '@/lib/services/category.service';

export const metadata = { title: 'Categorias' };

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Categorias</h1>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-neutral-600">Nova categoria</h2>
        <CategoryForm />
      </section>
      <ul className="flex flex-col gap-3">
        {categories.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm">
            <CategoryForm category={c} />
            <DeleteCategoryButton id={c.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
