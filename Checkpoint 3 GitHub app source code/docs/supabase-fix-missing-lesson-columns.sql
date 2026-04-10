-- Run this in Supabase → SQL Editor if you see:
-- PGRST204 Could not find the 'harmony_structure' column ...
--
-- Adds the five lesson columns when they are missing (safe to re-run).

alter table public.generations
  add column if not exists track_vibe text,
  add column if not exists rhythm_energy text,
  add column if not exists harmony_structure text,
  add column if not exists instrument_magic text,
  add column if not exists pro_tip text;

-- If you never added model_explanation:
alter table public.generations
  add column if not exists model_explanation text;
