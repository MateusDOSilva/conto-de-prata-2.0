create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     bigint generated always as identity unique, -- número amigável (#123) para o WhatsApp
  customer_name    text not null,
  customer_phone   text not null,
  customer_note    text,
  total_amount     numeric(12,2) not null,
  status           text not null default 'pending',
  idempotency_key  text not null unique,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint orders_status_check check (status in ('pending', 'contacted', 'completed', 'cancelled')),
  constraint orders_total_check check (total_amount >= 0),
  constraint orders_customer_name_len check (char_length(customer_name) between 2 and 100),
  constraint orders_customer_phone_format check (customer_phone ~ '^[0-9]{10,13}$'),
  constraint orders_customer_note_len check (customer_note is null or char_length(customer_note) <= 500),
  constraint orders_idempotency_key_len check (char_length(idempotency_key) between 16 and 100)
);

create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();
