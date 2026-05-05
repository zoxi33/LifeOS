-- Run this in Supabase SQL Editor

create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  focus_minutes int not null default 0,
  notes text,
  created_at timestamptz default now()
);

alter table daily_logs enable row level security;
create policy "authenticated full access" on daily_logs for all to authenticated using (true) with check (true);
