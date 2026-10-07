-- ===== profiles =====
create policy "profiles: usuário lê o próprio" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: admin lê todos" on public.profiles
  for select to authenticated using (public.is_admin());
-- Sem policy de INSERT/UPDATE/DELETE para authenticated: ninguém altera role via API.
-- Gestão de roles futura: Server Action admin + service role, ou policy específica.
revoke insert, update, delete on public.profiles from anon, authenticated;

-- ===== categories =====
create policy "categories: público lê ativas" on public.categories
  for select to anon, authenticated using (active);
create policy "categories: admin lê todas" on public.categories
  for select to authenticated using (public.is_admin());
create policy "categories: admin insere" on public.categories
  for insert to authenticated with check (public.is_admin());
create policy "categories: admin atualiza" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categories: admin exclui" on public.categories
  for delete to authenticated using (public.is_admin());

-- ===== products =====
create policy "products: público lê ativos de categoria ativa" on public.products
  for select to anon, authenticated using (
    active and exists (select 1 from public.categories c where c.id = category_id and c.active)
  );
create policy "products: admin lê todos" on public.products
  for select to authenticated using (public.is_admin());
create policy "products: admin insere" on public.products
  for insert to authenticated with check (public.is_admin());
create policy "products: admin atualiza" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products: admin exclui" on public.products
  for delete to authenticated using (public.is_admin());

-- ===== store_settings =====
-- Todas as colunas atuais são públicas por natureza (nome, cores, WhatsApp, redes).
-- Se surgir coluna sensível, trocar por uma VIEW pública com as colunas permitidas.
create policy "store_settings: público lê" on public.store_settings
  for select to anon, authenticated using (true);
create policy "store_settings: admin atualiza" on public.store_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke insert, delete on public.store_settings from anon, authenticated;

-- ===== orders =====
-- anon: nenhuma policy => não lê, não insere, não altera. Pedido nasce só via create_order() no servidor.
create policy "orders: admin lê" on public.orders
  for select to authenticated using (public.is_admin());
create policy "orders: admin atualiza" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- admin só pode mudar o status (total, itens e dados do cliente são imutáveis via API)
revoke insert, update, delete on public.orders from anon, authenticated;
grant update (status) on public.orders to authenticated;

-- ===== order_items =====
create policy "order_items: admin lê" on public.order_items
  for select to authenticated using (public.is_admin());
revoke insert, update, delete on public.order_items from anon, authenticated;

-- ===== defesa em profundidade: anon nunca escreve em nada =====
revoke insert, update, delete on public.categories, public.products from anon;
