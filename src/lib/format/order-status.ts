import type { OrderStatus } from '@/types/database.types';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendentes',
  contacted: 'Em contato',
  completed: 'Concluídos',
  cancelled: 'Cancelados',
};
