create table if not exists streak_trackers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  started_at date not null default current_date,
  active     bool not null default true,
  created_at timestamptz default now()
);

alter table streak_trackers enable row level security;
create policy "authenticated full access" on streak_trackers
  for all using (auth.role() = 'authenticated');

-- seed initial entries
insert into streak_trackers (name, started_at) values
  ('No Fap',  current_date),
  ('No Porn', current_date)
on conflict do nothing;
