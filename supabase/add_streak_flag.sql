-- Run in Supabase SQL Editor
alter table checklist_items add column if not exists is_streak boolean default false;
