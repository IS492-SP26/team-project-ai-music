import { getSupabaseServerClient } from '@/lib/supabaseServer'

/** AI lesson object (same shape as `EducationalBreakdown` in the generate route). */
export type LessonPayload = {
  summary: string
  rhythm_lesson: string
  harmonic_lesson: string
  instrument_spotlight: string
  fun_fact: string
}

/** Settings snapshot saved with each generation (matches `MusicSettings` from the form). */
export type GenerationSettings = {
  prompt: string
  mood: string
  instruments: string[]
  bpm: number
  melody: string
  bassline: string
  drumPattern: string
  excitement: number
  vibe: string
}

/**
 * Row shape for `public.generations`.
 * Lesson text lives in `track_vibe`, `rhythm_energy`, etc.
 * `model_explanation` is optional legacy column in DB — we send `null` (use structured columns instead).
 */
export type GenerationRow = {
  description: string
  mood: string
  vibe: string
  instruments: string[]
  bpm: number
  excitement: number
  melody_style: string
  bassline_style: string
  drum_pattern: string
  model_explanation: string | null
  track_vibe: string
  rhythm_energy: string
  harmony_structure: string
  instrument_magic: string
  pro_tip: string
}

export function buildGenerationRow(
  settings: GenerationSettings,
  educational: LessonPayload
): GenerationRow {
  return {
    description: settings.prompt,
    mood: settings.mood,
    vibe: settings.vibe,
    instruments: settings.instruments,
    bpm: settings.bpm,
    excitement: settings.excitement,
    melody_style: settings.melody,
    bassline_style: settings.bassline,
    drum_pattern: settings.drumPattern,
    model_explanation: null,
    track_vibe: educational.summary,
    rhythm_energy: educational.rhythm_lesson,
    harmony_structure: educational.harmonic_lesson,
    instrument_magic: educational.instrument_spotlight,
    pro_tip: educational.fun_fact,
  }
}

/**
 * Call from the generate API route only (server).
 * Inserts are non-blocking for the HTTP response if you void-call from the route.
 */
export async function insertGenerationServer(settings: GenerationSettings, educational: LessonPayload) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    console.warn('[Supabase] Insert skipped: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    return
  }

  const row = buildGenerationRow(settings, educational)
  const { error } = await supabase.from('generations').insert(row)

  if (error) {
    console.error('[Supabase] generations insert failed:', error.message, error.code, error.details, error.hint)
    if (error.code === '42501') {
      console.error(
        '[Supabase] RLS blocked insert. Fix: add SUPABASE_SERVICE_ROLE_KEY to .env.local (server only), or run docs/supabase-rls-and-grants.sql in the SQL Editor.'
      )
    }
    return
  }

  console.log('[Supabase] generations row inserted ok')
}
