# Conto de Prata 2.0 — Catálogo de Semijoias

Catálogo online com pedido via WhatsApp. Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth, Storage) + Zod.

Decisões de arquitetura: [`docs/architecture.md`](docs/architecture.md).

## Requisitos

- Node.js 22 (`.nvmrc`)
- Docker (para o Supabase local) — opcional se usar um projeto Supabase na nuvem

## Setup

```bash
npm ci
cp .env.example .env.local     # preencher com as chaves do Supabase

# Supabase local (Docker)
npm run db:start               # sobe Postgres/Auth/Storage e mostra URL + chaves
npm run db:reset               # aplica supabase/migrations + supabase/seed.sql
npm run db:types               # gera src/types/database.types.ts

npm run dev                    # http://localhost:3000
```

### Criar o administrador

O cadastro público está desativado. Crie o usuário no painel do Supabase (Authentication → Add user) e promova:

```sql
update public.profiles set role = 'admin' where id = '<uuid-do-usuario>';
```

## Scripts

| Script                                  | O que faz                                              |
| --------------------------------------- | ------------------------------------------------------ |
| `npm run dev` / `build` / `start`       | Next.js                                                |
| `npm run lint` / `typecheck` / `format` | qualidade                                              |
| `npm test`                              | testes unitários (Vitest)                              |
| `npm run db:test`                       | testes do banco (pgTAP, `supabase test db`)            |
| `scripts/db-validate/run.sh`            | valida migrations + RLS num Postgres puro (sem Docker) |

## Estrutura

```
src/app/            rotas (público e /admin)
src/components/     UI por domínio (catalog, cart, checkout, admin, layout, ui)
src/lib/services/   regras de negócio
src/lib/supabase/   clientes (server, browser, service role server-only, middleware)
src/lib/validations schemas Zod
supabase/           config, migrations, seed
docs/               arquitetura
```
