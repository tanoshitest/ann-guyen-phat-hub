create extension if not exists "pgcrypto";

create table if not exists public.demo_records (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_key text not null,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (table_name, record_key)
);

alter table public.demo_records enable row level security;

drop policy if exists "demo_records_select" on public.demo_records;
drop policy if exists "demo_records_insert" on public.demo_records;
drop policy if exists "demo_records_update" on public.demo_records;

create policy "demo_records_select"
on public.demo_records for select
using (true);

create policy "demo_records_insert"
on public.demo_records for insert
with check (true);

create policy "demo_records_update"
on public.demo_records for update
using (true)
with check (true);
