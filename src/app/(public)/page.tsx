import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryList } from '@/components/catalog/category-card';
import { ProductGrid } from '@/components/catalog/product-grid';
import { PresentationCarousel } from '@/components/layout/presentation-carousel';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { listCategories } from '@/lib/services/category.service';
import { listProducts } from '@/lib/services/product.service';
import { getStoreSettings } from '@/lib/services/store-settings.service';
import { publicEnv } from '@/lib/env';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const storeName = settings?.store_name ?? 'Conto de Pratas';
  const description =
    settings?.description ??
    'Acessórios que contam a sua história. Descubra semijoias e acessórios da Conto de Pratas.';
  const title = 'Acessórios que contam a sua história';

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: storeName,
      title: `${title} | ${storeName}`,
      description,
      url: '/',
      images: settings?.presentation_images?.[0]
        ? [{ url: settings.presentation_images[0], alt: storeName }]
        : settings?.logo_url
          ? [{ url: settings.logo_url, alt: storeName }]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${storeName}`,
      description,
      images: settings?.presentation_images?.[0]
        ? [settings.presentation_images[0]]
        : settings?.logo_url
          ? [settings.logo_url]
          : undefined,
    },
  };
}

export default async function HomePage() {
  const [settings, categories, products] = await Promise.all([
    getStoreSettings(),
    listCategories(),
    listProducts({ limit: 8 }),
  ]);
  const storeName = settings?.store_name ?? 'Conto de Pratas';
  const presentationTitle = settings?.presentation_title ?? 'Acessórios que contam a sua história.';
  const presentationText =
    settings?.description ??
    'Peças para celebrar sua identidade, elevar sua autoestima e acompanhar os momentos que fazem parte de você.';
  const presentationImages = settings?.presentation_images ?? [];
  const instagramUrl = settings?.instagram_url ?? 'https://www.instagram.com/contodepratass/';
  const activeCategories = categories.filter((c) => c.active);
  const featured = products.filter((p) => p.active);
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: storeName,
    url: publicEnv.siteUrl,
    description: presentationText,
    image: presentationImages.length > 0 ? presentationImages : (settings?.logo_url ?? undefined),
    telephone: settings?.whatsapp_number ? `+${settings.whatsapp_number}` : undefined,
    sameAs: [settings?.instagram_url, settings?.facebook_url, settings?.tiktok_url].filter(
      (url): url is string => Boolean(url),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd).replace(/</g, '\\u003c') }}
      />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="text-center lg:text-left">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--color-primary)] uppercase">
            {storeName} · Acessórios
          </p>
          <h1 className="mx-auto mt-5 max-w-2xl font-serif text-5xl leading-[1.02] sm:text-6xl lg:mx-0 lg:text-7xl">
            {presentationTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-current/70 sm:text-lg lg:mx-0">
            {presentationText}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/produtos"
              className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              Descobrir a coleção
            </Link>
            {settings && <WhatsAppButton whatsappNumber={settings.whatsapp_number} />}
          </div>
          <div className="mt-7 flex flex-col items-center gap-3 text-sm text-current/60 sm:flex-row sm:justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4 text-[var(--color-primary)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7.5" cy="18" r="1.5" />
                <circle cx="17.5" cy="18" r="1.5" />
              </svg>
              Enviamos para todo o Brasil
            </span>
            <span className="hidden text-current/30 sm:inline" aria-hidden="true">
              ·
            </span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-current/30 underline-offset-4 transition hover:text-[var(--color-primary)]"
            >
              Acompanhe @contodepratass
            </a>
          </div>
        </div>

        <PresentationCarousel images={presentationImages} storeName={storeName} />
      </section>

      <section aria-labelledby="categorias" className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 text-center">
          <p className="text-xs tracking-[0.22em] text-[var(--color-primary)] uppercase">
            Encontre o seu estilo
          </p>
          <h2 id="categorias" className="mt-2 font-serif text-2xl sm:text-3xl">
            Explore por categoria
          </h2>
        </div>
        <CategoryList categories={activeCategories} />
      </section>

      <section aria-labelledby="destaques" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] text-[var(--color-primary)] uppercase">
              Feitos para acompanhar você
            </p>
            <h2 id="destaques" className="mt-2 font-serif text-2xl sm:text-3xl">
              Peças em destaque
            </h2>
          </div>
          <Link href="/produtos" className="text-sm text-[var(--color-primary)] hover:underline">
            Ver coleção
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </>
  );
}
