-- Buckets públicos para leitura via URL pública (CDN). Sem SVG (risco de XSS).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880,
     array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('store-assets',   'store-assets',   true, 2097152,
     array['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'])
on conflict (id) do nothing;
