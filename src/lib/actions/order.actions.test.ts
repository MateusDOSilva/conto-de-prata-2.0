import { beforeEach, describe, expect, it, vi } from 'vitest';

const createOrder = vi.fn();
vi.mock('@/lib/services/order.service', () => {
  class OrderError extends Error {
    constructor(
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }
  return { createOrder: (...a: unknown[]) => createOrder(...a), OrderError };
});

const { createOrderAction } = await import('./order.actions');
const { OrderError } = await import('@/lib/services/order.service');

const P1 = '11111111-1111-4111-8111-111111111111';
const P2 = '22222222-2222-4222-8222-222222222222';
const valid = {
  customer_name: 'Maria Silva',
  customer_phone: '(21) 99999-9999',
  idempotency_key: '33333333-3333-4333-8333-333333333333',
  items: [{ product_id: P1, quantity: 3 }],
};

beforeEach(() => {
  createOrder.mockReset();
  createOrder.mockResolvedValue({
    orderNumber: 7,
    totalAmount: 150,
    created: true,
    whatsappUrl: 'https://wa.me/1',
  });
});

describe('createOrderAction', () => {
  it('cria pedido válido e devolve a URL do WhatsApp', async () => {
    const r = await createOrderAction(valid);
    expect(r).toEqual({
      ok: true,
      orderNumber: 7,
      totalAmount: 150,
      whatsappUrl: 'https://wa.me/1',
    });
  });

  it('descarta preço/total enviados pelo cliente', async () => {
    await createOrderAction({
      ...valid,
      total_amount: 0.01,
      items: [{ product_id: P1, quantity: 1, unit_price: 0.01, subtotal: 0.01 }],
    });
    const input = createOrder.mock.calls[0][0];
    expect(input).not.toHaveProperty('total_amount');
    expect(input.items[0]).toEqual({ product_id: P1, quantity: 1 });
    expect(input.customer_phone).toBe('21999999999');
  });

  it.each([0, -1, 4, 1.5])('rejeita quantidade %s sem tocar no banco', async (quantity) => {
    const r = await createOrderAction({ ...valid, items: [{ product_id: P1, quantity }] });
    expect(r.ok).toBe(false);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('rejeita o mesmo produto em duas linhas (bypass do limite)', async () => {
    const r = await createOrderAction({
      ...valid,
      items: [
        { product_id: P1, quantity: 3 },
        { product_id: P1, quantity: 3 },
      ],
    });
    expect(r.ok).toBe(false);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('aceita vários produtos com até 3 unidades cada', async () => {
    const r = await createOrderAction({
      ...valid,
      items: [
        { product_id: P1, quantity: 3 },
        { product_id: P2, quantity: 3 },
      ],
    });
    expect(r.ok).toBe(true);
  });

  it('exige idempotency_key', async () => {
    const rest: Partial<typeof valid> = { ...valid };
    delete rest.idempotency_key;
    expect((await createOrderAction(rest)).ok).toBe(false);
  });

  it('bloqueia bots pelo honeypot', async () => {
    expect((await createOrderAction({ ...valid, website: 'spam' })).ok).toBe(false);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('traduz produto indisponível em mensagem amigável', async () => {
    createOrder.mockRejectedValue(new OrderError('PRODUCT_UNAVAILABLE', 'Indisponível'));
    expect(await createOrderAction(valid)).toEqual({
      ok: false,
      error: 'Indisponível',
      code: 'PRODUCT_UNAVAILABLE',
    });
  });

  it('não vaza detalhes de erros inesperados', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    createOrder.mockRejectedValue(new Error('connection string postgres://secret'));
    const r = await createOrderAction(valid);
    expect(r.ok).toBe(false);
    expect(JSON.stringify(r)).not.toContain('secret');
  });
});
