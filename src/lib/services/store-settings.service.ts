import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { StoreSettingsInput } from '@/lib/validations/store-settings';
import type { Database } from '@/types/database.types';

export type StoreSettings = Database['public']['Tables']['store_settings']['Row'];

export const getStoreSettings = cache(async (): Promise<StoreSettings | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('store_settings').select('*').maybeSingle();
  if (error) throw error;
  return data;
});

/** Admin: atualiza a linha única. RLS garante que só admin consegue. */
export async function updateStoreSettings(
  input: StoreSettingsInput & { logo_url?: string | null; favicon_url?: string | null },
) {
  const supabase = await createClient();
  const current = await getStoreSettings();
  if (!current) throw new Error('Configuração da loja não encontrada');
  const { error } = await supabase.from('store_settings').update(input).eq('id', current.id);
  if (error) throw error;
}
