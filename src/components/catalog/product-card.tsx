import Image from 'next/image';
import Link from 'next/link';
import { formatBRL } from '@/lib/format/currency';
import type { ProductWithCategory } from '@/lib/services/product.service';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

export function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-serif text-sm text-neutral-400">
            Sem foto
          </span>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        {product.category && (
          <p className="text-xs tracking-[0.18em] text-neutral-500 uppercase">
            {product.category.name}
          </p>
        )}
        <h3 className="font-serif text-base leading-snug sm:text-lg">
          <Link href={`/produtos/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm font-medium text-[var(--color-primary)]">
          {formatBRL(product.price)}
        </p>
        <div className="mt-auto pt-2">
          <AddToCartButton
            product={{
              product_id: product.id,
              name: product.name,
              slug: product.slug,
              price: Number(product.price),
              image_url: product.image_url,
            }}
            compact
          />
        </div>
      </div>
    </article>
  );
}
