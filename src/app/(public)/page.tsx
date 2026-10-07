import Link from 'next/link';
import { CategoryList } from '@/components/catalog/category-card';
import { ProductGrid } from '@/components/catalog/product-grid';
import { SocialLinks } from '@/components/layout/social-links';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { listCategories } from '@/lib/services/category.service';
import { listProducts } from '@/lib/services/product.service';
import { getStoreSettings } from '@/lib/services/store-settings.service';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, products] = await Promise.all([
    getStoreSettings(),
    listCategories(),
    listProducts({ limit: 8 }),
  ]);
  const activeCategories = categories.filter((c) => c.active);
  const featured = products.filter((p) => p.active);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 text-center sm:pt-20">
        <p className="text-xs tracking-[0.3em] text-[var(--color-primary)] uppercase">Semijoias</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          {settings?.store_name}
        </h1>
        {settings?.description && (
          <p className="mx-auto mt-4 max-w-xl text-base text-current/70">{settings.description}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/produtos"
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Ver catálogo
          </Link>
          {settings && <WhatsAppButton whatsappNumber={settings.whatsapp_number} />}
        </div>
        {settings && <SocialLinks settings={settings} className="mt-6 justify-center" />}
      </section>

      <section aria-labelledby="categorias" className="mx-auto max-w-6xl px-4 py-6">
        <h2 id="categorias" className="sr-only">
          Categorias
        </h2>
        <CategoryList categories={activeCategories} />
      </section>

      <section aria-labelledby="destaques" className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <h2 id="destaques" className="font-serif text-2xl sm:text-3xl">
            Destaques
          </h2>
          <Link href="/produtos" className="text-sm text-[var(--color-primary)] hover:underline">
            Ver todos
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </>
  );
}
