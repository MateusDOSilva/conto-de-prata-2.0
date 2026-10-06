import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { publicEnv } from '@/lib/env';

/**
 * Cliente service role: IGNORA RLS. Uso restrito a operações que o RLS não cobre
 * por design (create_order). `server-only` quebra o build se for importado no cliente.
 */
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');

  return createClient<Database>(publicEnv.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
