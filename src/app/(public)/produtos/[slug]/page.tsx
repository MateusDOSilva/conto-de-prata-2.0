import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { formatBRL } from '@/lib/format/currency';
import { getActiveProductBySlug } from '@/lib/services/product.service';
import { SlugSchema } from '@/lib/validations/catalog';
import { MAX_QUANTITY_PER_PRODUCT } from '@/lib/validations/order';

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const parsed = SlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  return getActiveProductBySlug(parsed.data);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) return {};
  const description =
    product.description?.slice(0, 160) ?? `${product.name} — ${formatBRL(product.price)}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/produtos/${product.slug}`,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.image_url ?? undefined,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: Number(product.price).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <nav aria-label="Navegação estrutural" className="mb-6 text-sm text-current/60">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Início
            </Link>{' '}
            /
          </li>
          {product.category && (
            <li>
              <Link href={`/categoria/${product.category.slug}`} className="hover:underline">
                {product.category.name}
              </Link>{' '}
              /
            </li>
          )}
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[var(--color-muted)]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-neutral-400">
              Sem foto
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4 md:py-6">
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          <p className="text-2xl text-[var(--color-primary)]">{formatBRL(product.price)}</p>
          {product.description && (
            <p className="leading-relaxed whitespace-pre-line text-current/80">
              {product.description}
            </p>
          )}
          <div className="mt-4 max-w-sm">
            <AddToCartButton
              product={{
                product_id: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                image_url: product.image_url,
              }}
            />
            <p className="mt-2 text-xs text-current/60">
              Máximo de {MAX_QUANTITY_PER_PRODUCT} unidades deste produto por pedido.
            </p>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
