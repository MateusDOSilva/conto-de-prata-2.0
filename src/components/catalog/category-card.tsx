import Link from 'next/link';
import type { Category } from '@/lib/services/category.service';

export function CategoryCard({ category }: { category: Pick<Category, 'name' | 'slug'> }) {
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className="flex items-center justify-center rounded-full border border-[var(--color-primary)]/30 px-5 py-2.5 text-sm tracking-wide whitespace-nowrap transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
    >
      {category.name}
    </Link>
  );
}

export function CategoryList({
  categories,
}: {
  categories: Pick<Category, 'name' | 'slug' | 'id'>[];
}) {
  if (categories.length === 0) return null;
  return (
    <nav aria-label="Categorias">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:flex-wrap sm:justify-center">
        {categories.map((c) => (
          <li key={c.id}>
            <CategoryCard category={c} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
