#!/usr/bin/env bash
# Valida migrations + regras (RLS, create_order, constraints) num PostgreSQL puro,
# usando um stub dos schemas auth/storage do Supabase. Útil quando Docker não está disponível.
# Uso: PSQL="psql -U postgres" ./scripts/db-validate/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
PSQL=${PSQL:-psql}
DB=${DB:-semijoias_validate}
$PSQL -q -c "drop database if exists $DB" -c "create database $DB"
cat scripts/db-validate/_stub_supabase.sql supabase/migrations/*.sql \
  | $PSQL -q -v ON_ERROR_STOP=1 -d "$DB" >/dev/null
# rules_test.sql cria seus próprios dados (não usa seed.sql)
$PSQL -q -v ON_ERROR_STOP=1 -d "$DB" -c "insert into categories(name,slug) values ('Anéis','aneis'),('Brincos','brincos'),('Colares','colares'),('Pulseiras','pulseiras'),('Conjuntos','conjuntos')" >/dev/null
sed -n '/^insert into public.products/,$p' supabase/seed.sql | $PSQL -q -v ON_ERROR_STOP=1 -d "$DB" >/dev/null
$PSQL -q -v ON_ERROR_STOP=1 -d "$DB" -f scripts/db-validate/rules_test.sql 2>&1 | grep -E 'OK|FAIL|ERROR|PASSARAM' | sed 's/^.*NOTICE:  //'
