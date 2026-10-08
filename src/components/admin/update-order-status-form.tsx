'use client';

import { useActionState } from 'react';
import { updateOrderStatusAction } from '@/lib/actions/admin-order.actions';
import type { OrderStatus } from '@/types/database.types';
import { ORDER_STATUSES } from '@/lib/validations/catalog';
import { STATUS_LABELS } from '@/lib/format/order-status';
import { FormMessage, SubmitButton } from './ui';

export function UpdateOrderStatusForm({ id, status }: { id: string; status: OrderStatus }) {
  const [state, action] = useActionState(updateOrderStatusAction, {});

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`status-${id}`} className="sr-only">
        Status
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
      >
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <SubmitButton pendingText="Atualizando…">Atualizar</SubmitButton>
      <span className="basis-full">
        <FormMessage state={state} />
      </span>
    </form>
  );
}
