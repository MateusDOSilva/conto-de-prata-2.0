'use client';

import { useActionState } from 'react';
import { deleteCategoryAction, saveCategoryAction } from '@/lib/actions/category.actions';
import type { Category } from '@/lib/services/category.service';
import { Field, FormMessage, inputClass, SubmitButton } from './ui';

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action] = useActionState(saveCategoryAction, {});
  const suffix = category?.id ?? 'new';
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="min-w-48 flex-1">
        <Field label="Nome" name="name" state={state}>
          <input
            id={`name-${suffix}`}
            name="name"
            defaultValue={category?.name}
            required
            maxLength={80}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="min-w-40 flex-1">
        <Field label="Slug" name="slug" state={state}>
          <input
            id={`slug-${suffix}`}
            name="slug"
            defaultValue={category?.slug}
            placeholder="gerado do nome"
            className={inputClass}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={category?.active ?? true} /> Ativa
      </label>
      <SubmitButton>{category ? 'Salvar' : 'Adicionar'}</SubmitButton>
      <div className="w-full">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  const [state, action] = useActionState(deleteCategoryAction, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Excluir esta categoria?')) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-700 hover:underline">
        Excluir
      </button>
      {state.message && !state.ok && (
        <p className="mt-1 max-w-56 text-xs text-red-700">{state.message}</p>
      )}
    </form>
  );
}
