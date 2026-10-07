import { describe, expect, it } from 'vitest';
import { cartReducer, type CartState } from './use-cart';

const A = { product_id: 'a', name: 'Anel', slug: 'anel', price: 50, image_url: null };
const B = { product_id: 'b', name: 'Brinco', slug: 'brinco', price: 30, image_url: null };
const empty: CartState = { items: [], checkoutKey: null };

describe('cartReducer', () => {
  it('soma quantidades do mesmo produto e limita a 3', () => {
    let s = cartReducer(empty, { type: 'add', item: A, quantity: 2 });
    s = cartReducer(s, { type: 'add', item: A, quantity: 2 });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(3);
  });

  it('permite até 3 unidades de cada produto diferente', () => {
    let s = cartReducer(empty, { type: 'add', item: A, quantity: 3 });
    s = cartReducer(s, { type: 'add', item: B, quantity: 3 });
    expect(s.items.map((i) => i.quantity)).toEqual([3, 3]);
  });

  it.each([
    [4, 3],
    [0, 1],
    [-1, 1],
    [2.7, 2],
    [Number.NaN, 1],
  ])('setQuantity(%s) vira %s', (input, expected) => {
    const s = cartReducer(
      { items: [{ ...A, quantity: 1 }], checkoutKey: 'k' },
      {
        type: 'setQuantity',
        product_id: 'a',
        quantity: input,
      },
    );
    expect(s.items[0].quantity).toBe(expected);
  });

  it('alterar o carrinho invalida a chave de idempotência', () => {
    const s = cartReducer(
      { items: [{ ...A, quantity: 1 }], checkoutKey: 'k' },
      { type: 'add', item: B, quantity: 1 },
    );
    expect(s.checkoutKey).toBeNull();
  });

  it('ensureCheckoutKey reutiliza a chave existente (retry/duplo clique)', () => {
    const s1 = cartReducer(
      { items: [{ ...A, quantity: 1 }], checkoutKey: null },
      { type: 'ensureCheckoutKey' },
    );
    const s2 = cartReducer(s1, { type: 'ensureCheckoutKey' });
    expect(s1.checkoutKey).toMatch(/^[0-9a-f-]{36}$/);
    expect(s2.checkoutKey).toBe(s1.checkoutKey);
  });

  it('sync remove indisponíveis e atualiza preço exibido', () => {
    const s = cartReducer(
      {
        items: [
          { ...A, quantity: 2 },
          { ...B, quantity: 1 },
        ],
        checkoutKey: 'k',
      },
      { type: 'sync', products: [{ ...A, price: 60 }] },
    );
    expect(s.items).toEqual([{ ...A, price: 60, quantity: 2 }]);
    expect(s.checkoutKey).toBeNull();
  });

  it('clear esvazia o carrinho', () => {
    expect(
      cartReducer({ items: [{ ...A, quantity: 1 }], checkoutKey: 'k' }, { type: 'clear' }),
    ).toEqual(empty);
  });
});
