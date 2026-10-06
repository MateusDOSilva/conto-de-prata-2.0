-- Dados de teste: roda só em `supabase db reset` (local), nunca em produção.
update public.store_settings set instagram_url = 'https://instagram.com/minhaloja';

insert into public.categories (name, slug) values
  ('Anéis', 'aneis'), ('Brincos', 'brincos'), ('Colares', 'colares'),
  ('Pulseiras', 'pulseiras'), ('Conjuntos', 'conjuntos');

insert into public.products (category_id, name, slug, description, price)
select c.id, v.name, v.slug, v.description, v.price
from (values
  ('brincos',   'Brinco Dourado',     'brinco-dourado',     'Brinco banhado a ouro 18k.',        79.90),
  ('colares',   'Colar Delicado',     'colar-delicado',     'Colar fino com pingente ponto de luz.', 99.90),
  ('aneis',     'Anel Minimalista',   'anel-minimalista',   'Anel liso, ajustável.',             59.90),
  ('pulseiras', 'Pulseira Elegance',  'pulseira-elegance',  'Pulseira com zircônias.',           89.90),
  ('conjuntos', 'Conjunto Pérola',    'conjunto-perola',    'Colar + brincos com pérolas.',     149.90)
) as v(cat_slug, name, slug, description, price)
join public.categories c on c.slug = v.cat_slug;
