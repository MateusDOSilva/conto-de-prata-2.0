\set ON_ERROR_STOP 1
-- helpers
create or replace function pg_temp.expect_error(sql text, label text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'OK   % -> %', label, sqlerrm; return; end;
  raise exception 'FAIL % (esperava erro)', label;
end $$;
create or replace function pg_temp.ok(cond boolean, label text) returns void language plpgsql as $$
begin if cond then raise notice 'OK   %', label; else raise exception 'FAIL %', label; end if; end $$;

-- usuários: um admin e um comum
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@x.com'),
  ('00000000-0000-0000-0000-00000000000c', 'cliente@x.com');
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000a';
select pg_temp.ok((select role from profiles where id='00000000-0000-0000-0000-00000000000c') = 'customer', 'trigger cria profile customer');

create temp table ids as select slug, id from products;
grant select on ids to anon, authenticated, service_role;

-- ===== create_order como service_role =====
set role service_role;
select pg_temp.ok((select created from create_order('João Silva','21999999999',null,
  jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',2),
                    jsonb_build_object('product_id',(select id from ids where slug='colar-delicado'),'quantity',1)),
  'key-0000000000000001')), 'pedido válido criado');
select pg_temp.ok((select total_amount from orders where idempotency_key='key-0000000000000001') = 259.70, 'total = 2*79.90 + 99.90 = 259.70');
select pg_temp.ok((select count(*) from order_items oi join orders o on o.id=oi.order_id where o.idempotency_key='key-0000000000000001') = 2, '2 itens criados');

-- idempotência
select pg_temp.ok((select not created from create_order('João Silva','21999999999',null,
  jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',2)),
  'key-0000000000000001')), 'mesma idempotency_key devolve pedido existente');
select pg_temp.ok((select count(*) from orders) = 1, 'nenhum pedido duplicado');

-- quantidades
select pg_temp.ok((select created from create_order('Ana Souza','21988887777',null,
  jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='anel-minimalista'),'quantity',3),
                    jsonb_build_object('product_id',(select id from ids where slug='pulseira-elegance'),'quantity',3),
                    jsonb_build_object('product_id',(select id from ids where slug='conjunto-perola'),'quantity',2),
                    jsonb_build_object('product_id',(select id from ids where slug='colar-delicado'),'quantity',1)),
  'key-0000000000000002')), 'A×3 + B×3 + C×2 + D×1 é válido (sem limite global)');
select pg_temp.expect_error($q$ select create_order('Ana','21988887777',null, jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',4)), 'key-0000000000000003') $q$, 'quantidade 4');
select pg_temp.expect_error($q$ select create_order('Ana','21988887777',null, jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',0)), 'key-0000000000000004') $q$, 'quantidade 0');
select pg_temp.expect_error($q$ select create_order('Ana','21988887777',null, jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',-1)), 'key-0000000000000005') $q$, 'quantidade -1');
select pg_temp.expect_error($q$ select create_order('Ana','21988887777',null, jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',3), jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',3)), 'key-0000000000000006') $q$, 'mesmo produto em 2 linhas (burlar limite)');
select pg_temp.expect_error($q$ select create_order('Ana','21988887777',null, jsonb_build_array(jsonb_build_object('product_id',gen_random_uuid(),'quantity',1)), 'key-0000000000000007') $q$, 'produto inexistente');
select pg_temp.expect_error($q$ select create_order('Ana','21988887777',null, '[]'::jsonb, 'key-0000000000000008') $q$, 'carrinho vazio');
select pg_temp.ok((select count(*) from orders) = 2, 'falhas fizeram ROLLBACK (nenhum pedido órfão)');
reset role;

update products set active = false where slug = 'anel-minimalista';
set role service_role;
select pg_temp.expect_error($q$ select create_order('Ana','21988887777',null, jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='anel-minimalista'),'quantity',1)), 'key-0000000000000009') $q$, 'produto inativo');
reset role;
update products set active = true where slug = 'anel-minimalista';

-- snapshot de preço
update products set price = 99.90 where slug = 'brinco-dourado';
select pg_temp.ok((select unit_price from order_items where product_name='Brinco Dourado' limit 1) = 79.90, 'snapshot mantém R$ 79,90 após mudança de preço');
set role service_role;
select create_order('Bia','21977776666',null, jsonb_build_array(jsonb_build_object('product_id',(select id from ids where slug='brinco-dourado'),'quantity',1)), 'key-0000000000000010');
select pg_temp.ok((select total_amount from orders where idempotency_key='key-0000000000000010') = 99.90, 'novo pedido usa preço atual do banco');
reset role;

-- ===== anon =====
set role anon;
select pg_temp.expect_error($q$ select create_order('X','21999999999',null,'[]','key-0000000000000011') $q$, 'anon não executa create_order');
select pg_temp.ok((select count(*) from orders) = 0, 'anon não lista pedidos');
select pg_temp.ok((select count(*) from order_items) = 0, 'anon não lista itens');
select pg_temp.expect_error($q$ insert into orders (customer_name, customer_phone, total_amount, idempotency_key) values ('X','21999999999',0.01,'key-0000000000000012') $q$, 'anon não insere pedido direto');
select pg_temp.expect_error($q$ update products set price = 0.01 $q$, 'anon não altera preço');
select pg_temp.ok((select count(*) from store_settings) = 1, 'anon lê store_settings');
reset role;
update products set active = false where slug = 'anel-minimalista';
update categories set active = false where slug = 'pulseiras';
set role anon;
select pg_temp.ok((select count(*) from products) = 3, 'anon só vê produtos ativos de categoria ativa');
select pg_temp.ok((select count(*) from categories) = 4, 'anon só vê categorias ativas');
reset role;

-- ===== usuário autenticado sem role admin =====
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
update products set price = 0.01; -- RLS: 0 linhas afetadas
select pg_temp.ok((select count(*) from products where price = 0.01) = 0, 'não-admin não altera produto');
select pg_temp.ok((select count(*) from orders) = 0, 'não-admin não lê pedidos');
select pg_temp.expect_error($q$ update profiles set role = 'admin' where id = auth.uid() $q$, 'usuário não altera o próprio role');
select pg_temp.expect_error($q$ insert into storage.objects (bucket_id, name) values ('product-images','x.jpg') $q$, 'não-admin não faz upload');
reset role;

-- ===== admin =====
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select pg_temp.ok((select count(*) from products) = 5, 'admin vê todos os produtos (inclusive inativos)');
update products set price = 109.90 where slug = 'brinco-dourado';
select pg_temp.ok((select price from products where slug='brinco-dourado') = 109.90, 'admin altera preço');
update orders set status = 'contacted' where idempotency_key = 'key-0000000000000001';
select pg_temp.ok((select status from orders where idempotency_key='key-0000000000000001') = 'contacted', 'admin altera status');
select pg_temp.expect_error($q$ update orders set status = 'shipped' $q$, 'status inválido');
select pg_temp.expect_error($q$ update orders set total_amount = 0 $q$, 'admin não altera total do pedido');
select pg_temp.expect_error($q$ update store_settings set instagram_url = 'javascript:alert(1)' $q$, 'URL social javascript:');
select pg_temp.expect_error($q$ update store_settings set facebook_url = 'data:text/html,<script>' $q$, 'URL social data:');
select pg_temp.expect_error($q$ insert into store_settings (store_name, whatsapp_number) values ('Outra','5521999999999') $q$, 'segunda linha de store_settings');
select pg_temp.expect_error($q$ delete from categories where slug = 'brincos' $q$, 'excluir categoria com produtos (RESTRICT)');
insert into storage.objects (bucket_id, name) values ('store-assets','logo/logo.png');
select pg_temp.expect_error($q$ insert into storage.objects (bucket_id, name) values ('store-assets','outra/x.png') $q$, 'store-assets fora de logo/ ou favicon/');
reset role;
\echo TODOS OS TESTES PASSARAM
