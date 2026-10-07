'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import {
  createCategory,
  deleteCategory,
  DomainError,
  updateCategory,
} from '@/lib/services/category.service';
import { CreateCategorySchema, slugify, UpdateCategorySchema } from '@/lib/validations/catalog';
import { type ActionState, fieldErrorsFrom } from './action-result';

function revalidateCatalog() {
  revalidatePath('/', 'layout');
}

function read(form: FormData) {
  const name = String(form.get('name') ?? '');
  return {
    id: form.get('id') ?? undefined,
    name,
    slug: String(form.get('slug') ?? '') || slugify(name),
    active: form.get('active'),
  };
}

export async function saveCategoryAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = read(form);
  const parsed = raw.id ? UpdateCategorySchema.safeParse(raw) : CreateCategorySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const { name, slug, active } = parsed.data;
    const id = 'id' in parsed.data ? (parsed.data.id as string) : null;
    if (id) await updateCategory(id, { name, slug, active });
    else await createCategory({ name, slug, active });
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, message: e.message };
    throw e;
  }
  revalidateCatalog();
  return { ok: true, message: 'Categoria salva.' };
}

export async function deleteCategoryAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = UpdateCategorySchema.shape.id.safeParse(form.get('id'));
  if (!id.success) return { ok: false, message: 'Categoria inválida.' };
  try {
    await deleteCategory(id.data);
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, message: e.message };
    throw e;
  }
  revalidateCatalog();
  return { ok: true, message: 'Categoria excluída.' };
}
