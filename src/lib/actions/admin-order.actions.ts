'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { updateOrderStatus } from '@/lib/services/order.service';
import { UpdateOrderStatusSchema } from '@/lib/validations/catalog';

export async function updateOrderStatusAction(form: FormData) {
  await requireAdmin();
  const parsed = UpdateOrderStatusSchema.safeParse({
    id: form.get('id'),
    status: form.get('status'),
  });
  if (!parsed.success) return;
  await updateOrderStatus(parsed.data.id, parsed.data.status);
  revalidatePath('/admin', 'layout');
}
