-- Run in Supabase → SQL Editor if inserts fail with:
-- "new row violates row-level security policy" (42501)
-- when using ONLY the anon key (no service role in the app).

-- 1) Let anonymous API clients insert rows
grant usage on schema public to anon;
grant insert on table public.generations to anon;

-- 2) RLS: allow inserts for role `anon` (used by the anon key)
alter table public.generations enable row level security;

drop policy if exists "Allow anonymous inserts on generations" on public.generations;
create policy "Allow anonymous inserts on generations"
  on public.generations
  for insert
  to anon
  with check (true);
