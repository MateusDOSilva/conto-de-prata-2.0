drop policy if exists "storage: admin envia assets da loja" on storage.objects;

create policy "storage: admin envia assets da loja" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'store-assets'
    and (storage.foldername(name))[1] in ('logo', 'favicon', 'presentation')
    and public.is_admin()
  );
