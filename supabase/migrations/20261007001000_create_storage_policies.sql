-- Leitura pública é servida pela URL pública do bucket (public = true).
-- NÃO criamos policy de SELECT para anon: evita listagem do conteúdo dos buckets.

create policy "storage: admin envia imagens de produto" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "storage: admin envia assets da loja" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'store-assets'
    and (storage.foldername(name))[1] in ('logo', 'favicon')
    and public.is_admin()
  );

create policy "storage: admin lê objetos" on storage.objects
  for select to authenticated
  using (bucket_id in ('product-images', 'store-assets') and public.is_admin());

create policy "storage: admin atualiza objetos" on storage.objects
  for update to authenticated
  using (bucket_id in ('product-images', 'store-assets') and public.is_admin())
  with check (bucket_id in ('product-images', 'store-assets') and public.is_admin());

create policy "storage: admin remove objetos" on storage.objects
  for delete to authenticated
  using (bucket_id in ('product-images', 'store-assets') and public.is_admin());
