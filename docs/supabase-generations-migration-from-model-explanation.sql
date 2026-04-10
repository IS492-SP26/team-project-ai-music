-- If you created `generations` before the five lesson columns existed, run this once.
-- Keeps `model_explanation` if present (app sends NULL there and uses structured columns).

alter table public.generations
  add column if not exists track_vibe text,
  add column if not exists rhythm_energy text,
  add column if not exists harmony_structure text,
  add column if not exists instrument_magic text,
  add column if not exists pro_tip text;
