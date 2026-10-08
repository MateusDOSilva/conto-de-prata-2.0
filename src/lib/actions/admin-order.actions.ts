'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { updateOrderStatus } from '@/lib/services/order.service';
import { UpdateOrderStatusSchema } from '@/lib/validations/catalog';
import type { ActionState } from './action-result';

export async function updateOrderStatusAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = UpdateOrderStatusSchema.safeParse({
    id: form.get('id'),
    status: form.get('status'),
  });
  if (!parsed.success) return { ok: false, message: 'Pedido ou status inválido.' };

  try {
    await updateOrderStatus(parsed.data.id, parsed.data.status);
  } catch (error) {
    console.error('updateOrderStatusAction', error);
    return { ok: false, message: 'Não foi possível atualizar o pedido. Tente novamente.' };
  }

  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/dashboard');
  return { ok: true, message: 'Status do pedido atualizado.' };
}
