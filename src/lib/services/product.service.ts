import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import { mapDbError } from './category.service';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductWithCategory = Product & {
  category: { name: string; slug: string } | null;
};
type ProductInput = Pick<
  Product,
  'name' | 'slug' | 'description' | 'price' | 'category_id' | 'active' | 'image_url'
>;

const SELECT_WITH_CATEGORY = '*, category:categories(name, slug)';

/** Público: RLS filtra ativos de categoria ativa. Admin: todos. */
export async function listProducts(opts: { categoryId?: string; limit?: number } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select(SELECT_WITH_CATEGORY)
    .order('created_at', { ascending: false });
  if (opts.categoryId) query = query.eq('category_id', opts.categoryId);
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as ProductWithCategory[];
}

/** Página pública: exige ativo explicitamente (admin logado também não vê inativo na vitrine). */
export async function getActiveProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(SELECT_WITH_CATEGORY)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ProductWithCategory | null;
}

/** Carrinho: busca nome/preço atuais só para exibição (o servidor recalcula no pedido). */
export async function getActiveProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price, image_url')
    .in('id', ids)
    .eq('active', true);
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProduct(input: ProductInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').insert(input);
  if (error) mapDbError(error);
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').update(input).eq('id', id);
  if (error) mapDbError(error);
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) mapDbError(error);
}
