-- Linha única de configuração da loja (necessária também em produção).
-- O administrador edita os valores em /admin/configuracoes.
insert into public.store_settings (store_name, description, primary_color, secondary_color,
                                   background_color, text_color, whatsapp_number)
values ('Minha Loja de Semijoias', 'Semijoias delicadas banhadas a ouro 18k.',
        '#B08D57', '#1F1F1F', '#FAF7F2', '#2B2B2B', '5521999999999');
