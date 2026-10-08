import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { CreateOrderInput } from '@/lib/validations/order';
import { buildOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp/build-order-message';
import type { Database, OrderStatus } from '@/types/database.types';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderWithItems = Order & { items: OrderItem[] };

export class OrderError extends Error {
  constructor(
    public readonly code:
      'PRODUCT_UNAVAILABLE' | 'INVALID_ITEMS' | 'STORE_NOT_CONFIGURED' | 'UNKNOWN',
    message: string,
  ) {
    super(message);
  }
}

const DB_ERRORS: Record<string, OrderError> = {
  PRODUCT_UNAVAILABLE: new OrderError(
    'PRODUCT_UNAVAILABLE',
    'Um ou mais produtos não estão mais disponíveis. Revise seu carrinho.',
  ),
  INVALID_ITEMS: new OrderError('INVALID_ITEMS', 'Itens do pedido inválidos.'),
  INVALID_ITEMS_COUNT: new OrderError('INVALID_ITEMS', 'Quantidade de itens inválida.'),
};

/**
 * Cria o pedido de forma transacional e idempotente via create_order() (PL/pgSQL).
 * Recebe só product_id + quantity: nome, preço, subtotal e total vêm do banco.
 * Usa service role porque anon não tem permissão de EXECUTE (nem de ler orders).
 */
export async function createOrder(input: CreateOrderInput) {
  const db = createServiceRoleClient();

  const { data, error } = await db.rpc('create_order', {
    p_customer_name: input.customer_name,
    p_customer_phone: input.customer_phone,
    p_customer_note: input.customer_note,
    p_items: input.items,
    p_idempotency_key: input.idempotency_key,
  });

  if (error) {
    const known = Object.keys(DB_ERRORS).find((k) => error.message.includes(k));
    if (known) throw DB_ERRORS[known];
    // CHECK/UNIQUE violados (23514/23505) = entrada inválida que passou pelo Zod
    if (error.code === '23514' || error.code === '23505') throw DB_ERRORS.INVALID_ITEMS;
    console.error('create_order falhou', error.code, error.message);
    throw new OrderError('UNKNOWN', 'Não foi possível registrar o pedido. Tente novamente.');
  }

  const result = data?.[0];
  if (!result) throw new OrderError('UNKNOWN', 'Não foi possível registrar o pedido.');

  const [{ data: order, error: orderError }, { data: settings, error: settingsError }] =
    await Promise.all([
      db
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', result.order_id)
        .order('created_at', { referencedTable: 'order_items' })
        .single(),
      db.from('store_settings').select('whatsapp_number').single(),
    ]);
  if (orderError || !order)
    throw new OrderError('UNKNOWN', 'Pedido criado, mas não foi possível carregá-lo.');
  if (settingsError || !settings)
    throw new OrderError('STORE_NOT_CONFIGURED', 'WhatsApp da loja não configurado.');

  const full = order as unknown as OrderWithItems;
  const message = buildOrderMessage(full);

  return {
    orderNumber: full.order_number,
    totalAmount: Number(full.total_amount),
    created: result.created,
    whatsappUrl: buildWhatsAppUrl(settings.whatsapp_number, message),
  };
}

// ===== Admin (sessão do usuário → RLS: só admin lê/atualiza) =====

export async function listOrders(opts: { status?: OrderStatus } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (opts.status) query = query.eq('status', opts.status);
  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as OrderWithItems[];
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Pedido não encontrado ou sem permissão para atualizar.');
}

export async function getOrderStats() {
  const supabase = await createClient();
  const statuses: OrderStatus[] = ['pending', 'contacted', 'completed', 'cancelled'];
  const counts = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', status);
      if (error) throw error;
      return [status, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<OrderStatus, number>;
}
