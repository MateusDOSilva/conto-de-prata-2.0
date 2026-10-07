'use client';

import { useActionState } from 'react';
import { deleteProductAction } from '@/lib/actions/product.actions';

export function DeleteProductButton({ id }: { id: string }) {
  const [state, action] = useActionState(deleteProductAction, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Excluir este produto definitivamente?')) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-700 hover:underline">
        Excluir
      </button>
      {state.message && !state.ok && (
        <p className="mt-1 max-w-56 text-xs text-red-700">{state.message}</p>
      )}
    </form>
  );
}
