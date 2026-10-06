create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_name_len check (char_length(name) between 1 and 80),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- slug já tem índice pelo UNIQUE
create index categories_active_idx on public.categories (active);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();
