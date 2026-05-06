create table if not exists water_logs (
  id         uuid primary key default gen_random_uuid(),
  date       date not null unique,
  glasses    int  not null default 0,
  target     int  not null default 8
);

alter table water_logs enable row level security;
create policy "authenticated full access" on water_logs
  for all using (auth.role() = 'authenticated');
