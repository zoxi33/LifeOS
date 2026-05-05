-- Run in Supabase SQL Editor

alter table daily_logs add column if not exists checklist jsonb default '{}';

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table checklist_items enable row level security;
create policy "authenticated full access" on checklist_items for all to authenticated using (true) with check (true);
