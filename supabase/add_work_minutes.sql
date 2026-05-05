-- Run in Supabase SQL Editor
alter table daily_logs add column if not exists work_minutes int not null default 0;
