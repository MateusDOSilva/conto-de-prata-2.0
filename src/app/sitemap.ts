import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/env';
import { listCategories } from '@/lib/services/category.service';
import { listProducts } from '@/lib/services/product.service';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl;
  const [categories, products] = await Promise.all([
    listCategories().catch(() => []),
    listProducts().catch(() => []),
  ]);
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/produtos`, changeFrequency: 'daily', priority: 0.9 },
    ...categories
      .filter((c) => c.active)
      .map((c) => ({
        url: `${base}/categoria/${c.slug}`,
        lastModified: c.updated_at,
        priority: 0.8,
      })),
    ...products
      .filter((p) => p.active)
      .map((p) => ({
        url: `${base}/produtos/${p.slug}`,
        lastModified: p.updated_at,
        priority: 0.7,
      })),
  ];
}
