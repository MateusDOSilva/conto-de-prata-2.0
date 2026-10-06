import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInput = Pick<Category, 'name' | 'slug' | 'active'>;

export class DomainError extends Error {}

function mapError(error: { code?: string; message: string }): never {
  if (error.code === '23505') throw new DomainError('Já existe um registro com esse slug');
  if (error.code === '23503')
    throw new DomainError(
      'Não é possível excluir: existem registros vinculados. Desative em vez de excluir.',
    );
  throw new Error(error.message);
}

/** Público: RLS devolve só categorias ativas. Admin: todas. */
export async function listCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCategory(input: CategoryInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').insert(input);
  if (error) mapError(error);
}

export async function updateCategory(id: string, input: CategoryInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').update(input).eq('id', id);
  if (error) mapError(error);
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) mapError(error);
}

export { mapError as mapDbError };
