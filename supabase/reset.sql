-- LifeOS — Reset bazy danych
-- Usuwa wszystkie stare tabele i tworzy nowe od zera
-- Uruchom w: Supabase Dashboard → SQL Editor → New query

-- Drop wszystko (kolejność ważna — najpierw zależne)
drop table if exists goal_milestones cascade;
drop table if exists habit_logs cascade;
drop table if exists goals cascade;
drop table if exists habits cascade;
drop table if exists journal_entries cascade;
drop table if exists transactions cascade;
drop table if exists sleep_logs cascade;
drop table if exists weight_logs cascade;
drop table if exists push_subscriptions cascade;
drop table if exists user_settings cascade;

-- habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  freq text not null,
  type text not null check (type in ('daily','weekly','custom')),
  target int not null default 1,
  active bool default true,
  created_at timestamptz default now()
);

-- habit_logs
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  done bool default false,
  unique(habit_id, date)
);

-- journal_entries
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text,
  body text,
  mood int check (mood between 1 and 5),
  sleep_hours numeric(4,2),
  weight_kg numeric(5,2),
  tags text[],
  created_at timestamptz default now()
);

-- goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  current numeric,
  target numeric,
  unit text,
  start_date date,
  due_date date,
  note text,
  active bool default true
);

-- goal_milestones
create table goal_milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade,
  name text not null,
  done bool default false,
  due_label text
);

-- transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  name text not null,
  category text,
  amount numeric(10,2),
  type text check (type in ('expense','income','invest'))
);

-- sleep_logs
create table sleep_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  hours numeric(4,2),
  bed_time numeric(4,2),
  wake_time numeric(4,2),
  quality int check (quality between 1 and 5)
);

-- weight_logs
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  measured_at timestamptz not null,
  weight_kg numeric(5,2)
);

-- push_subscriptions
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- user_settings
create table user_settings (
  key text primary key,
  value jsonb
);

-- RLS
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table journal_entries enable row level security;
alter table goals enable row level security;
alter table goal_milestones enable row level security;
alter table transactions enable row level security;
alter table sleep_logs enable row level security;
alter table weight_logs enable row level security;
alter table push_subscriptions enable row level security;
alter table user_settings enable row level security;

-- Policies — zalogowany użytkownik ma pełny dostęp
create policy "authenticated full access" on habits for all to authenticated using (true) with check (true);
create policy "authenticated full access" on habit_logs for all to authenticated using (true) with check (true);
create policy "authenticated full access" on journal_entries for all to authenticated using (true) with check (true);
create policy "authenticated full access" on goals for all to authenticated using (true) with check (true);
create policy "authenticated full access" on goal_milestones for all to authenticated using (true) with check (true);
create policy "authenticated full access" on transactions for all to authenticated using (true) with check (true);
create policy "authenticated full access" on sleep_logs for all to authenticated using (true) with check (true);
create policy "authenticated full access" on weight_logs for all to authenticated using (true) with check (true);
create policy "authenticated full access" on push_subscriptions for all to authenticated using (true) with check (true);
create policy "authenticated full access" on user_settings for all to authenticated using (true) with check (true);
