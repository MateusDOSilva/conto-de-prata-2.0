import { z } from 'zod';
import { BrazilPhoneSchema } from './phone';
import { cleanText } from './text';

export const MAX_QUANTITY_PER_PRODUCT = 3;
export const MAX_DISTINCT_ITEMS = 50;

export const QuantitySchema = z
  .number({ message: 'Quantidade inválida' })
  .int('Quantidade inválida')
  .min(1, 'Quantidade mínima é 1')
  .max(MAX_QUANTITY_PER_PRODUCT, `Máximo de ${MAX_QUANTITY_PER_PRODUCT} unidades por produto`);

export const OrderItemInputSchema = z.object({
  product_id: z.uuid('Produto inválido'),
  quantity: QuantitySchema,
});

export const CreateOrderSchema = z.object({
  customer_name: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(2, 'Informe seu nome').max(100, 'Nome muito longo')),
  customer_phone: BrazilPhoneSchema,
  customer_note: z
    .string()
    .optional()
    .transform((v) => (v ? cleanText(v) : ''))
    .pipe(z.string().max(500, 'Observação muito longa (máx. 500)'))
    .transform((v) => v || null),
  items: z
    .array(OrderItemInputSchema)
    .min(1, 'Carrinho vazio')
    .max(MAX_DISTINCT_ITEMS, 'Itens demais no pedido')
    .refine(
      (items) => new Set(items.map((i) => i.product_id)).size === items.length,
      'Produto repetido no pedido',
    ),
  idempotency_key: z.uuid('Chave de pedido inválida'),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
