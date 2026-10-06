'use server';

import { z } from 'zod';
import { getActiveProductsByIds } from '@/lib/services/product.service';

const IdsSchema = z.array(z.uuid()).max(50);

/** Devolve nome/preço atuais dos produtos ativos do carrinho (só para exibição). */
export async function getCartProductsAction(ids: unknown) {
  const parsed = IdsSchema.safeParse(ids);
  if (!parsed.success) return [];
  const products = await getActiveProductsByIds(parsed.data);
  return products.map((p) => ({
    product_id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image_url: p.image_url,
  }));
}
