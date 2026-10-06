import { z } from 'zod';
import { cleanText } from './text';

export const SlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use apenas letras minúsculas, números e hífens');

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const checkbox = z.preprocess((v) => v === true || v === 'on' || v === 'true', z.boolean());

export const CreateCategorySchema = z.object({
  name: z.string().transform(cleanText).pipe(z.string().min(1, 'Informe o nome').max(80)),
  slug: SlugSchema,
  active: checkbox,
});
export const UpdateCategorySchema = CreateCategorySchema.extend({ id: z.uuid() });

/** Aceita "79,90", "79.90", "1.234,56". */
export const PriceSchema = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return v;
    const s = v.trim().replace(/\s|R\$/g, '');
    const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
    return normalized === '' ? NaN : Number(normalized);
  },
  z
    .number({ message: 'Preço inválido' })
    .finite('Preço inválido')
    .min(0, 'Preço não pode ser negativo')
    .max(9_999_999_999.99, 'Preço muito alto')
    .refine(
      (n) => Math.round(n * 100) === Number((n * 100).toFixed(6)),
      'Máximo de 2 casas decimais',
    ),
);

export const CreateProductSchema = z.object({
  name: z.string().transform(cleanText).pipe(z.string().min(1, 'Informe o nome').max(120)),
  slug: SlugSchema,
  description: z
    .string()
    .optional()
    .transform((v) => (v ? cleanText(v) : null))
    .pipe(z.string().max(5000).nullable()),
  price: PriceSchema,
  category_id: z.uuid('Selecione uma categoria'),
  active: checkbox,
});
export const UpdateProductSchema = CreateProductSchema.extend({ id: z.uuid() });

export const ORDER_STATUSES = ['pending', 'contacted', 'completed', 'cancelled'] as const;
export const UpdateOrderStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(ORDER_STATUSES),
});
