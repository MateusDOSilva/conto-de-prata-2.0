import { describe, expect, it } from 'vitest';
import { buildOrderMessage, buildWhatsAppUrl } from './build-order-message';

const order = {
  order_number: 123,
  customer_name: 'João Silva',
  customer_phone: '21999999999',
  customer_note: 'Gostaria de saber as opções de entrega.',
  total_amount: '259.70',
  items: [
    { product_name: 'Brinco Dourado', quantity: 2, unit_price: 79.9, subtotal: 159.8 },
    { product_name: 'Colar Delicado', quantity: 1, unit_price: 99.9, subtotal: 99.9 },
  ],
};

describe('buildOrderMessage', () => {
  it('gera a mensagem no formato combinado', () => {
    const msg = buildOrderMessage(order);
    expect(msg).toContain('Olá! Gostaria de finalizar o pedido #123.');
    expect(msg).toContain('Telefone: (21) 99999-9999');
    expect(msg).toContain(
      '1. Brinco Dourado\nQuantidade: 2\nValor unitário: R$ 79,90\nSubtotal: R$ 159,80',
    );
    expect(msg).toContain('Total: R$ 259,70');
    expect(msg).toContain('Observação: Gostaria de saber as opções de entrega.');
  });

  it('omite observação vazia', () => {
    expect(buildOrderMessage({ ...order, customer_note: null })).not.toContain('Observação');
  });
});

describe('buildWhatsAppUrl', () => {
  it('codifica a mensagem para URL', () => {
    const url = buildWhatsAppUrl('5521999999999', 'Pedido #1 & total: R$ 10,00\nok');
    expect(url).toBe(
      'https://wa.me/5521999999999?text=Pedido%20%231%20%26%20total%3A%20R%24%2010%2C00%0Aok',
    );
    expect(decodeURIComponent(new URL(url).searchParams.get('text')!)).toContain('&');
  });

  it('rejeita número inválido', () => {
    expect(() => buildWhatsAppUrl('abc', 'x')).toThrow();
  });
});
