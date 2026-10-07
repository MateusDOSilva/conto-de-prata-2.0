'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { DomainError } from '@/lib/services/category.service';
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from '@/lib/services/product.service';
import { getFile, removeImageByUrl, uploadImage, UploadError } from '@/lib/storage/upload';
import { CreateProductSchema, slugify, UpdateProductSchema } from '@/lib/validations/catalog';
import { type ActionState, fieldErrorsFrom } from './action-result';

export async function saveProductAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(form.get('name') ?? '');
  const raw = {
    id: form.get('id') || undefined,
    name,
    slug: String(form.get('slug') ?? '') || slugify(name),
    description: String(form.get('description') ?? ''),
    price: String(form.get('price') ?? ''),
    category_id: form.get('category_id'),
    active: form.get('active'),
  };
  const parsed = raw.id ? UpdateProductSchema.safeParse(raw) : CreateProductSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const { name: n, slug, description, price, category_id, active } = parsed.data;
  const values = { name: n, slug, description, price, category_id, active };
  const file = getFile(form, 'image');
  const id = 'id' in parsed.data ? (parsed.data.id as string) : null;
  const existing = id ? await getProductById(id) : null;
  if (id && !existing) return { ok: false, message: 'Produto não encontrado.' };

  let image_url: string | undefined;
  try {
    if (file) image_url = await uploadImage('product-images', file, 'products');
    if (existing) await updateProduct(existing.id, image_url ? { ...values, image_url } : values);
    else await createProduct({ ...values, image_url: image_url ?? null });
  } catch (e) {
    if (image_url) await removeImageByUrl('product-images', image_url);
    if (e instanceof UploadError) return { ok: false, fieldErrors: { image: [e.message] } };
    if (e instanceof DomainError) return { ok: false, fieldErrors: { slug: [e.message] } };
    throw e;
  }
  if (image_url && existing?.image_url)
    await removeImageByUrl('product-images', existing.image_url);

  revalidatePath('/', 'layout');
  redirect('/admin/produtos');
}

export async function toggleProductAction(form: FormData) {
  await requireAdmin();
  const id = UpdateProductSchema.shape.id.safeParse(form.get('id'));
  if (!id.success) return;
  await updateProduct(id.data, { active: form.get('active') === 'true' });
  revalidatePath('/', 'layout');
}

export async function deleteProductAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = UpdateProductSchema.shape.id.safeParse(form.get('id'));
  if (!id.success) return { ok: false, message: 'Produto inválido.' };
  const product = await getProductById(id.data);
  try {
    await deleteProduct(id.data);
  } catch (e) {
    // ON DELETE RESTRICT: produto já vendido não pode ser apagado (histórico de pedidos).
    if (e instanceof DomainError)
      return { ok: false, message: 'Produto já possui pedidos. Desative-o em vez de excluir.' };
    throw e;
  }
  await removeImageByUrl('product-images', product?.image_url);
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Produto excluído.' };
}
