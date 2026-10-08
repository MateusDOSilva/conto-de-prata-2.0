'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import { saveProductAction } from '@/lib/actions/product.actions';
import type { Category } from '@/lib/services/category.service';
import type { Product } from '@/lib/services/product.service';
import { Field, FormMessage, inputClass, SubmitButton } from './ui';

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const [state, action] = useActionState(saveProductAction, {});
  return (
    <form action={action} className="grid max-w-2xl gap-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <Field label="Nome" name="name" state={state}>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={product?.name}
          className={inputClass}
        />
      </Field>
      <Field
        label="Slug"
        name="slug"
        state={state}
        hint="Deixe em branco para gerar a partir do nome."
      >
        <input id="slug" name="slug" defaultValue={product?.slug} className={inputClass} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Preço (R$)" name="price" state={state}>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            required
            placeholder="79,90"
            defaultValue={product ? Number(product.price).toFixed(2).replace('.', ',') : ''}
            className={inputClass}
          />
        </Field>
        <Field label="Categoria" name="category_id" state={state}>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={product?.category_id ?? ''}
            className={inputClass}
          >
            <option value="" disabled>
              Selecione…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.active ? '' : ' (inativa)'}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Descrição" name="description" state={state}>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={5000}
          defaultValue={product?.description ?? ''}
          className={inputClass}
        />
      </Field>
      <Field
        label="Imagem do produto"
        name="image"
        state={state}
        hint="Opcional. JPG, PNG, WebP ou AVIF, até 5 MB."
      >
        {product?.image_url && (
          <Image
            src={product.image_url}
            alt=""
            width={96}
            height={96}
            className="my-2 size-24 rounded-lg object-cover"
          />
        )}
        <div className="mt-2">
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="peer sr-only"
          />
          <label
            htmlFor="image"
            className="inline-flex cursor-pointer items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neutral-900 hover:bg-neutral-700"
          >
            {product?.image_url ? 'Trocar foto' : 'Adicionar foto'}
          </label>
        </div>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Produto
        ativo (visível no catálogo)
      </label>
      <FormMessage state={state} />
      <div>
        <SubmitButton>Salvar produto</SubmitButton>
      </div>
    </form>
  );
}
