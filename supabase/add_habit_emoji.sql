-- Run in Supabase SQL Editor
alter table habits add column if not exists emoji text default '';
