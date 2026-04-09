import type { PreviewSpec } from '@/lib/preview-spec'

/** Public URL base (files live under public/assets/audio/). */
export const AUDIO_SAMPLES_BASE = '/assets/audio'

export type SampleCategory = 'drums' | 'bass' | 'leads' | 'pads'

export interface ResolvedAudioSample {
  /** Unique key for logging and validation (e.g. mood:chill). */
  optionKey: string
  category: SampleCategory
  /** Path segment after /assets/audio/ — includes folder + filename, e.g. drums/Drums_FourOnTheFloor.mp3 */
  relativeFile: string
}

/** Strict [Category]_[StyleName].mp3 filenames under category subfolders. */

const MOOD: Record<string, string> = {
  chill: 'pads/Pads_MoodChill.mp3',
  energetic: 'pads/Pads_MoodEnergetic.mp3',
  dark: 'pads/Pads_MoodDark.mp3',
  uplifting: 'pads/Pads_MoodUplifting.mp3',
  ambient: 'pads/Pads_MoodAmbient.mp3',
}

const VIBE: Record<string, string> = {
  default: 'pads/Pads_VibeBalanced.mp3',
  oceanic: 'pads/Pads_VibeOceanic.mp3',
  gritty: 'pads/Pads_VibeGritty.mp3',
  ethereal: 'pads/Pads_VibeEthereal.mp3',
  warm: 'pads/Pads_VibeWarmHall.mp3',
  neon: 'pads/Pads_VibeNeonNight.mp3',
}

const MELODY: Record<string, string> = {
  simple: 'leads/Leads_MelodySimpleCatchy.mp3',
  complex: 'leads/Leads_MelodyComplexEvolving.mp3',
  minimal: 'leads/Leads_MelodyMinimalSparse.mp3',
  melodic: 'leads/Leads_MelodyRichMelodic.mp3',
}

const BASSLINE: Record<string, string> = {
  steady: 'bass/Bass_LineSteady.mp3',
  walking: 'bass/Bass_LineWalking.mp3',
  punchy: 'bass/Bass_LinePunchy.mp3',
  sub: 'bass/Bass_LineDeepSub.mp3',
}

const DRUM_PATTERN: Record<string, string> = {
  'four-on-floor': 'drums/Drums_PatternFourOnTheFloor.mp3',
  breakbeat: 'drums/Drums_PatternBreakbeat.mp3',
  trap: 'drums/Drums_PatternTrap.mp3',
  minimal: 'drums/Drums_PatternMinimal.mp3',
  acoustic: 'drums/Drums_PatternAcousticGroove.mp3',
}

/** Instrument row: route kit to drums, electric bass to bass, melodic instruments to leads. */
const INSTRUMENT: Record<string, string> = {
  synth: 'leads/Leads_InstrumentSynth.mp3',
  piano: 'leads/Leads_InstrumentPiano.mp3',
  guitar: 'leads/Leads_InstrumentGuitar.mp3',
  violin: 'leads/Leads_InstrumentViolin.mp3',
  drums: 'drums/Drums_InstrumentFullKit.mp3',
  bass: 'bass/Bass_InstrumentElectric.mp3',
}

const BPM_BUCKET: Record<number, string> = {
  60: 'drums/Drums_Tempo60.mp3',
  90: 'drums/Drums_Tempo90.mp3',
  120: 'drums/Drums_Tempo120.mp3',
  150: 'drums/Drums_Tempo150.mp3',
  180: 'drums/Drums_Tempo180.mp3',
}

function bpmToBucket(bpm: number): number {
  if (bpm < 85) return 60
  if (bpm < 105) return 90
  if (bpm < 135) return 120
  if (bpm < 160) return 150
  return 180
}

const EXCITEMENT: Record<string, string> = {
  low: 'pads/Pads_ExcitementCalm.mp3',
  mid: 'pads/Pads_ExcitementBalanced.mp3',
  high: 'pads/Pads_ExcitementIntense.mp3',
}

const PROMPT = 'pads/Pads_PromptStoryDemo.mp3'

/** Collect every mapped relative path for duplicate detection. */
export function collectAllMappedPaths(): { optionKey: string; relativeFile: string }[] {
  const out: { optionKey: string; relativeFile: string }[] = []
  for (const [k, v] of Object.entries(MOOD)) out.push({ optionKey: `mood:${k}`, relativeFile: v })
  for (const [k, v] of Object.entries(VIBE)) out.push({ optionKey: `vibe:${k}`, relativeFile: v })
  for (const [k, v] of Object.entries(MELODY)) out.push({ optionKey: `melody:${k}`, relativeFile: v })
  for (const [k, v] of Object.entries(BASSLINE)) out.push({ optionKey: `bassline:${k}`, relativeFile: v })
  for (const [k, v] of Object.entries(DRUM_PATTERN)) out.push({ optionKey: `drum:${k}`, relativeFile: v })
  for (const [k, v] of Object.entries(INSTRUMENT)) out.push({ optionKey: `instrument:${k}`, relativeFile: v })
  for (const [k, v] of Object.entries(BPM_BUCKET)) out.push({ optionKey: `bpm:${k}`, relativeFile: v })
  for (const [k, v] of Object.entries(EXCITEMENT)) out.push({ optionKey: `excitement:${k}`, relativeFile: v })
  out.push({ optionKey: 'prompt', relativeFile: PROMPT })
  return out
}

export interface SampleMapValidation {
  ok: boolean
  duplicates: { relativeFile: string; keys: string[] }[]
}

/**
 * Ensures no two UI options point at the same file path.
 * Call from dev / tests; logs a console warning on first preview if invalid.
 */
export function validateAudioSampleMap(): SampleMapValidation {
  const entries = collectAllMappedPaths()
  const byFile = new Map<string, string[]>()
  for (const { optionKey, relativeFile } of entries) {
    const list = byFile.get(relativeFile) ?? []
    list.push(optionKey)
    byFile.set(relativeFile, list)
  }
  const duplicates = [...byFile.entries()]
    .filter(([, keys]) => keys.length > 1)
    .map(([relativeFile, keys]) => ({ relativeFile, keys }))
  return { ok: duplicates.length === 0, duplicates }
}

function categoryFromPath(relativeFile: string): SampleCategory {
  const prefix = relativeFile.split('/')[0]
  if (prefix === 'drums' || prefix === 'bass' || prefix === 'leads' || prefix === 'pads') {
    return prefix
  }
  return 'pads'
}

export function resolveSampleForPreview(spec: PreviewSpec): ResolvedAudioSample | null {
  switch (spec.kind) {
    case 'mood': {
      const f = MOOD[spec.id]
      if (!f) return null
      return { optionKey: `mood:${spec.id}`, category: 'pads', relativeFile: f }
    }
    case 'vibe': {
      const f = VIBE[spec.id] ?? VIBE.default
      return { optionKey: `vibe:${spec.id}`, category: 'pads', relativeFile: f }
    }
    case 'melody': {
      const f = MELODY[spec.id]
      if (!f) return null
      return { optionKey: `melody:${spec.id}`, category: 'leads', relativeFile: f }
    }
    case 'bassline': {
      const f = BASSLINE[spec.id]
      if (!f) return null
      return { optionKey: `bassline:${spec.id}`, category: 'bass', relativeFile: f }
    }
    case 'drum': {
      const f = DRUM_PATTERN[spec.id]
      if (!f) return null
      return { optionKey: `drum:${spec.id}`, category: 'drums', relativeFile: f }
    }
    case 'instrument': {
      const f = INSTRUMENT[spec.id]
      if (!f) return null
      return {
        optionKey: `instrument:${spec.id}`,
        category: categoryFromPath(f),
        relativeFile: f,
      }
    }
    case 'bpm': {
      const bucket = bpmToBucket(spec.bpm)
      const f = BPM_BUCKET[bucket]
      if (!f) return null
      return { optionKey: `bpm:${bucket}`, category: 'drums', relativeFile: f }
    }
    case 'excitement': {
      const tier = spec.value < 34 ? 'low' : spec.value < 67 ? 'mid' : 'high'
      const f = EXCITEMENT[tier]
      return { optionKey: `excitement:${tier}`, category: 'pads', relativeFile: f }
    }
    case 'prompt':
      return { optionKey: 'prompt', category: 'pads', relativeFile: PROMPT }
  }
}

export function buildSampleUrl(relativeFile: string, cacheBust: string | number): string {
  const path = `${AUDIO_SAMPLES_BASE}/${relativeFile.replace(/^\//, '')}`
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}t=${cacheBust}`
}

/** Serializable map for tooling / docs (no duplicates if validateAudioSampleMap passes). */
export function getAudioSampleMapJson(): string {
  return JSON.stringify(
    {
      base: AUDIO_SAMPLES_BASE,
      entries: collectAllMappedPaths(),
    },
    null,
    2
  )
}
