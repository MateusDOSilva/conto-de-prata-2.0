'use server';

import { createOrder, OrderError } from '@/lib/services/order.service';
import { CreateOrderSchema } from '@/lib/validations/order';

export type CreateOrderActionResult =
  | { ok: true; orderNumber: number; totalAmount: number; whatsappUrl: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]>; code?: string };

/**
 * Recebe só dados do cliente + [{product_id, quantity}] + idempotency_key.
 * Qualquer price/total enviado é descartado pelo schema.
 */
export async function createOrderAction(payload: unknown): Promise<CreateOrderActionResult> {
  // honeypot: bots preenchem campos invisíveis
  if (payload && typeof payload === 'object' && (payload as Record<string, unknown>).website) {
    return { ok: false, error: 'Não foi possível registrar o pedido.' };
  }

  const parsed = CreateOrderSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, error: 'Revise os dados do pedido.', fieldErrors };
  }

  try {
    const order = await createOrder(parsed.data);
    return {
      ok: true,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      whatsappUrl: order.whatsappUrl,
    };
  } catch (err) {
    if (err instanceof OrderError) return { ok: false, error: err.message, code: err.code };
    console.error('createOrderAction', err);
    return { ok: false, error: 'Não foi possível registrar o pedido. Tente novamente.' };
  }
}
