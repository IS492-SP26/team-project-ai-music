/** Maps user "vibe" choice to mix and texture behavior (layman-friendly targets). */

export interface VibeMix {
  id: string
  /** How much each layer sends into the shared space bus (0–1). */
  wetRhythm: number
  wetBass: number
  wetPad: number
  wetLead: number
  wetTexture: number
  /** Pad swell length in seconds (slow vs quick bloom). */
  padAttack: number
  padRelease: number
  /** Extra lift for shoreline-style hiss / air. */
  textureStrength: number
  /** How soft vs sharp the air layer feels. */
  textureDarkness: number
  /** Reverb tail length hint (seconds of impulse decay). */
  reverbTail: number
  /** Echo timing as a fraction of one beat (musical repeat). */
  delayBeatFraction: number
  delayFeedback: number
  /** Shimmer on the lead (subtle pitch spread). */
  leadShimmer: number
  /** Master brightness curve start/end scale for the low-pass motion. */
  brightnessScale: number
}

const DEFAULT: VibeMix = {
  id: 'default',
  wetRhythm: 0.12,
  wetBass: 0.25,
  wetPad: 0.55,
  wetLead: 0.42,
  wetTexture: 0.5,
  padAttack: 0.55,
  padRelease: 0.35,
  textureStrength: 0.35,
  textureDarkness: 0.45,
  reverbTail: 2.2,
  delayBeatFraction: 0.5,
  delayFeedback: 0.22,
  leadShimmer: 0.06,
  brightnessScale: 1,
}

const PRESETS: Record<string, Partial<VibeMix>> = {
  oceanic: {
    id: 'oceanic',
    wetRhythm: 0.18,
    wetBass: 0.35,
    wetPad: 0.72,
    wetLead: 0.55,
    wetTexture: 0.85,
    padAttack: 1.35,
    padRelease: 0.55,
    textureStrength: 0.75,
    textureDarkness: 0.2,
    reverbTail: 3.6,
    delayBeatFraction: 0.75,
    delayFeedback: 0.38,
    leadShimmer: 0.09,
    brightnessScale: 0.85,
  },
  gritty: {
    id: 'gritty',
    wetRhythm: 0.06,
    wetBass: 0.12,
    wetPad: 0.22,
    wetLead: 0.18,
    wetTexture: 0.08,
    padAttack: 0.08,
    padRelease: 0.12,
    textureStrength: 0.12,
    textureDarkness: 0.75,
    reverbTail: 0.9,
    delayBeatFraction: 0.25,
    delayFeedback: 0.12,
    leadShimmer: 0.02,
    brightnessScale: 1.15,
  },
  ethereal: {
    id: 'ethereal',
    wetRhythm: 0.14,
    wetBass: 0.28,
    wetPad: 0.78,
    wetLead: 0.68,
    wetTexture: 0.48,
    padAttack: 0.95,
    padRelease: 0.65,
    textureStrength: 0.4,
    textureDarkness: 0.15,
    reverbTail: 4.2,
    delayBeatFraction: 0.667,
    delayFeedback: 0.42,
    leadShimmer: 0.14,
    brightnessScale: 1.05,
  },
  warm: {
    id: 'warm',
    wetRhythm: 0.1,
    wetBass: 0.3,
    wetPad: 0.48,
    wetLead: 0.38,
    wetTexture: 0.28,
    padAttack: 0.65,
    padRelease: 0.4,
    textureStrength: 0.22,
    textureDarkness: 0.55,
    reverbTail: 2.8,
    delayBeatFraction: 0.5,
    delayFeedback: 0.28,
    leadShimmer: 0.04,
    brightnessScale: 0.92,
  },
  neon: {
    id: 'neon',
    wetRhythm: 0.22,
    wetBass: 0.2,
    wetPad: 0.35,
    wetLead: 0.52,
    wetTexture: 0.25,
    padAttack: 0.12,
    padRelease: 0.18,
    textureStrength: 0.18,
    textureDarkness: 0.35,
    reverbTail: 1.6,
    delayBeatFraction: 0.375,
    delayFeedback: 0.32,
    leadShimmer: 0.08,
    brightnessScale: 1.25,
  },
}

export const VIBE_OPTIONS = [
  { id: 'default', label: 'Balanced' },
  { id: 'oceanic', label: 'Oceanic' },
  { id: 'gritty', label: 'Gritty' },
  { id: 'ethereal', label: 'Ethereal' },
  { id: 'warm', label: 'Warm hall' },
  { id: 'neon', label: 'Neon night' },
] as const

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export function getVibeMix(vibeRaw: string | undefined, excitement01: number): VibeMix {
  const key = (vibeRaw || 'default').toLowerCase().trim()
  const preset = PRESETS[key] ?? {}
  const base: VibeMix = { ...DEFAULT, ...preset, id: (preset.id as string) || key || 'default' }

  const e = clamp01(excitement01)
  const wetBoost = e * 0.22

  return {
    ...base,
    wetRhythm: clamp01(base.wetRhythm + wetBoost * 0.25),
    wetBass: clamp01(base.wetBass + wetBoost * 0.35),
    wetPad: clamp01(base.wetPad + wetBoost * 0.3),
    wetLead: clamp01(base.wetLead + wetBoost * 0.4),
    wetTexture: clamp01(base.wetTexture + wetBoost * 0.45),
    delayFeedback: clamp01(base.delayFeedback + e * 0.08),
    textureStrength: clamp01(base.textureStrength + e * 0.12),
    padAttack: Math.max(0.04, base.padAttack * (1 - e * 0.15)),
  }
}
