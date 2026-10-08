alter table public.store_settings
  drop constraint if exists store_settings_presentation_image_url_https,
  drop column if exists presentation_image_url,
  add column if not exists presentation_images text[] not null default '{}',
  drop constraint if exists store_settings_presentation_images_count,
  add constraint store_settings_presentation_images_count
    check (cardinality(presentation_images) <= 3);
