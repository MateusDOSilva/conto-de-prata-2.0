alter table public.store_settings
  add column presentation_title text not null default 'Acessórios que contam a sua história.',
  add column presentation_image_url text,
  add constraint store_settings_presentation_title_len
    check (char_length(presentation_title) between 1 and 120),
  add constraint store_settings_presentation_image_url_https
    check (presentation_image_url is null or presentation_image_url ~* '^https://');
