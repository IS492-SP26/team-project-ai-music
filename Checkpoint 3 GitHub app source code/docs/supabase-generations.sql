-- Run in Supabase SQL Editor (once). Matches the app insert shape + RLS for anon inserts.

create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text,
  mood text,
  vibe text,
  instruments text[],
  bpm int,
  excitement int,
  melody_style text,
  bassline_style text,
  drum_pattern text,
  model_explanation text,
  track_vibe text,
  rhythm_energy text,
  harmony_structure text,
  instrument_magic text,
  pro_tip text
);

alter table public.generations enable row level security;

-- Required when using the anon key (without service_role on the server)
grant usage on schema public to anon;
grant insert on table public.generations to anon;

drop policy if exists "Allow anonymous inserts on generations" on public.generations;
create policy "Allow anonymous inserts on generations"
  on public.generations
  for insert
  to anon
  with check (true);

-- Recommended for server-side inserts: set SUPABASE_SERVICE_ROLE_KEY in .env.local
-- (Dashboard → Settings → API → service_role). That bypasses RLS and avoids grant issues.
