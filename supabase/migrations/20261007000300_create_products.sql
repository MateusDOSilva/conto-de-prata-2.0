create table public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories (id) on delete restrict,
  name         text not null,
  slug         text not null unique,
  description  text,
  price        numeric(12,2) not null,
  image_url    text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint products_price_check check (price >= 0),
  constraint products_name_len check (char_length(name) between 1 and 120),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint products_description_len check (description is null or char_length(description) <= 5000),
  constraint products_image_url_https check (image_url is null or image_url ~* '^https://')
);

create index products_category_id_idx on public.products (category_id);
-- índice parcial: a vitrine pública só consulta produtos ativos
create index products_active_created_idx on public.products (created_at desc) where active;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();
