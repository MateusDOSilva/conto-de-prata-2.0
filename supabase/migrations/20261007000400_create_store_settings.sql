create table public.store_settings (
  id                uuid primary key default gen_random_uuid(),
  store_name        text not null,
  description       text,
  logo_url          text,
  favicon_url       text,
  primary_color     text,
  secondary_color   text,
  background_color  text,
  text_color        text,
  whatsapp_number   text not null,
  instagram_url     text,
  facebook_url      text,
  tiktok_url        text,
  youtube_url       text,
  linkedin_url      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- só dígitos, com DDI (ex.: 5521999999999) — formato exigido pelo wa.me
  constraint store_settings_whatsapp_format check (whatsapp_number ~ '^[1-9][0-9]{9,14}$'),
  constraint store_settings_colors_hex check (
        (primary_color    is null or primary_color    ~ '^#[0-9A-Fa-f]{6}$')
    and (secondary_color  is null or secondary_color  ~ '^#[0-9A-Fa-f]{6}$')
    and (background_color is null or background_color ~ '^#[0-9A-Fa-f]{6}$')
    and (text_color       is null or text_color       ~ '^#[0-9A-Fa-f]{6}$')
  ),
  -- última linha de defesa contra javascript:, data:, etc. (Zod faz a validação completa)
  constraint store_settings_urls_https check (
        (logo_url      is null or logo_url      ~* '^https://')
    and (favicon_url   is null or favicon_url   ~* '^https://')
    and (instagram_url is null or instagram_url ~* '^https://')
    and (facebook_url  is null or facebook_url  ~* '^https://')
    and (tiktok_url    is null or tiktok_url    ~* '^https://')
    and (youtube_url   is null or youtube_url   ~* '^https://')
    and (linkedin_url  is null or linkedin_url  ~* '^https://')
  )
);

-- garante uma única linha de configuração
create unique index store_settings_singleton_idx on public.store_settings ((true));

create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();
