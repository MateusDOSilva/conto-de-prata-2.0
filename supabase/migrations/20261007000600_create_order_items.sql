create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete restrict,
  product_name  text not null,          -- snapshot
  unit_price    numeric(12,2) not null, -- snapshot
  quantity      integer not null,
  subtotal      numeric(12,2) not null,
  created_at    timestamptz not null default now(),
  constraint order_items_quantity_check check (quantity >= 1 and quantity <= 3),
  constraint order_items_unit_price_check check (unit_price >= 0),
  constraint order_items_subtotal_check check (subtotal >= 0),
  constraint order_items_subtotal_consistent check (subtotal = unit_price * quantity),
  -- impede burlar o limite enviando o mesmo produto em duas linhas
  constraint order_items_order_product_unique unique (order_id, product_id)
);

-- order_id é coberto pelo índice do UNIQUE (order_id, product_id)
create index order_items_product_id_idx on public.order_items (product_id);

-- Criação transacional do pedido. Uma função PL/pgSQL roda inteira numa única transação:
-- qualquer RAISE desfaz orders + order_items (ROLLBACK automático).
create or replace function public.create_order(
  p_customer_name   text,
  p_customer_phone  text,
  p_customer_note   text,
  p_items           jsonb,   -- [{ "product_id": "uuid", "quantity": 1..3 }]
  p_idempotency_key text
)
returns table (order_id uuid, order_number bigint, created boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_id      uuid;
  v_order_number  bigint;
  v_item_count    int;
  v_valid_count   int;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'INVALID_ITEMS' using errcode = 'P0001';
  end if;

  v_item_count := jsonb_array_length(p_items);
  if v_item_count = 0 or v_item_count > 50 then
    raise exception 'INVALID_ITEMS_COUNT' using errcode = 'P0001';
  end if;

  -- Idempotência: se a chave já existe, devolve o pedido existente.
  -- ON CONFLICT serializa requisições concorrentes com a mesma chave.
  insert into public.orders (customer_name, customer_phone, customer_note, total_amount, idempotency_key)
  values (p_customer_name, p_customer_phone, nullif(p_customer_note, ''), 0, p_idempotency_key)
  on conflict (idempotency_key) do nothing
  returning id, orders.order_number into v_order_id, v_order_number;

  if v_order_id is null then
    select o.id, o.order_number into v_order_id, v_order_number
    from public.orders o where o.idempotency_key = p_idempotency_key;
    return query select v_order_id, v_order_number, false;
    return;
  end if;

  -- Itens: preço e nome vêm SEMPRE do banco; o cliente só manda product_id e quantity.
  -- Produto precisa estar ativo e na categoria ativa. FOR SHARE trava as linhas
  -- de products até o COMMIT (preço não muda no meio do pedido).
  with req as (
    select (e->>'product_id')::uuid as product_id,
           (e->>'quantity')::int    as quantity
    from jsonb_array_elements(p_items) e
  ),
  priced as (
    select p.id, p.name, p.price, r.quantity
    from req r
    join public.products p   on p.id = r.product_id and p.active
    join public.categories c on c.id = p.category_id and c.active
    for share of p
  )
  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
  select v_order_id, id, name, price, quantity, price * quantity
  from priced;

  get diagnostics v_valid_count = row_count;
  if v_valid_count <> v_item_count then
    -- produto inexistente, inativo ou de categoria inativa
    raise exception 'PRODUCT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  update public.orders
     set total_amount = (select sum(oi.subtotal) from public.order_items oi where oi.order_id = v_order_id)
   where id = v_order_id;

  return query select v_order_id, v_order_number, true;
end;
$$;

-- Só o servidor (service role) cria pedidos. Browser não chama esta RPC.
revoke execute on function public.create_order(text, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_order(text, text, text, jsonb, text) to service_role;
