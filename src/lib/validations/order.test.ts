import { describe, expect, it } from 'vitest';
import { CreateOrderSchema, QuantitySchema } from './order';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const base = {
  customer_name: 'João Silva',
  customer_phone: '(21) 99999-9999',
  customer_note: '',
  idempotency_key: uuid(999),
};

describe('QuantitySchema (máx. 3 por produto)', () => {
  it.each([1, 2, 3])('%i é válido', (q) => expect(QuantitySchema.safeParse(q).success).toBe(true));
  it.each([4, 0, -1, 1.5])('%s é inválido', (q) =>
    expect(QuantitySchema.safeParse(q).success).toBe(false),
  );
});

describe('CreateOrderSchema', () => {
  it('aceita vários produtos com 3 unidades cada (sem limite global)', () => {
    const r = CreateOrderSchema.safeParse({
      ...base,
      items: [
        { product_id: uuid(1), quantity: 3 },
        { product_id: uuid(2), quantity: 3 },
        { product_id: uuid(3), quantity: 2 },
        { product_id: uuid(4), quantity: 1 },
      ],
    });
    expect(r.success).toBe(true);
    expect(r.data?.customer_phone).toBe('21999999999');
    expect(r.data?.customer_note).toBeNull();
  });

  it('rejeita quantidade 4', () => {
    const r = CreateOrderSchema.safeParse({
      ...base,
      items: [{ product_id: uuid(1), quantity: 4 }],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita o mesmo produto em duas linhas (burlar o limite)', () => {
    const r = CreateOrderSchema.safeParse({
      ...base,
      items: [
        { product_id: uuid(1), quantity: 3 },
        { product_id: uuid(1), quantity: 3 },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('ignora price/total enviados pelo cliente', () => {
    const r = CreateOrderSchema.safeParse({
      ...base,
      total_amount: 0.01,
      items: [{ product_id: uuid(1), quantity: 1, price: 0.01, subtotal: 0.01 }],
    });
    expect(r.success).toBe(true);
    expect(r.data).not.toHaveProperty('total_amount');
    expect(r.data?.items[0]).toEqual({ product_id: uuid(1), quantity: 1 });
  });

  it('rejeita carrinho vazio e telefone inválido', () => {
    expect(CreateOrderSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(
      CreateOrderSchema.safeParse({
        ...base,
        customer_phone: '123',
        items: [{ product_id: uuid(1), quantity: 1 }],
      }).success,
    ).toBe(false);
  });
});
