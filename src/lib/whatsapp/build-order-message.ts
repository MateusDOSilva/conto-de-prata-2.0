import { formatBRL } from '@/lib/format/currency';
import { formatBrazilPhone } from '@/lib/format/phone';

export type OrderForMessage = {
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_note: string | null;
  total_amount: number | string;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number | string;
    subtotal: number | string;
  }[];
};

/** Monta o texto do pedido. Recebe dados lidos do banco (snapshot), nunca do navegador. */
export function buildOrderMessage(order: OrderForMessage): string {
  const lines: string[] = [
    `Olá! Gostaria de finalizar o pedido #${order.order_number}.`,
    '',
    `Cliente: ${order.customer_name}`,
    `Telefone: ${formatBrazilPhone(order.customer_phone)}`,
    '',
    'Produtos:',
  ];

  order.items.forEach((item, index) => {
    lines.push(
      '',
      `${index + 1}. ${item.product_name}`,
      `Quantidade: ${item.quantity}`,
      `Valor unitário: ${formatBRL(item.unit_price)}`,
      `Subtotal: ${formatBRL(item.subtotal)}`,
    );
  });

  lines.push('', `Total: ${formatBRL(order.total_amount)}`);
  if (order.customer_note) lines.push('', `Observação: ${order.customer_note}`);

  return lines.join('\n');
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digits = whatsappNumber.replace(/\D/g, '');
  if (!/^[1-9][0-9]{9,14}$/.test(digits)) throw new Error('Número de WhatsApp da loja inválido');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
