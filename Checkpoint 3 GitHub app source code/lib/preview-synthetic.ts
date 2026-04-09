/**
 * Built-in Web Audio previews when mapped MP3/WAV files are not on disk.
 * Each option keeps a distinct gesture (not one generic clip).
 */

import type { PreviewSpec } from '@/lib/preview-spec'
import { moodBaseHz, scheduleHat, scheduleKick, scheduleTone } from '@/lib/web-audio-helpers'

const PREVIEW_SEC = 5

let ctxRef: AudioContext | null = null
const sources: AudioScheduledSourceNode[] = []
let stopTimer: number | null = null

function clearSyntheticTimers() {
  if (stopTimer !== null) {
    window.clearTimeout(stopTimer)
    stopTimer = null
  }
}

export function stopSyntheticPreview() {
  sources.forEach((s) => {
    try {
      s.stop()
    } catch {
      /* noop */
    }
  })
  sources.length = 0
  clearSyntheticTimers()
}

async function ensureCtx(): Promise<AudioContext | null> {
  const Ctx =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!ctxRef) ctxRef = new Ctx()
  if (ctxRef.state === 'suspended') await ctxRef.resume()
  return ctxRef
}

function playSynthetic(spec: PreviewSpec, ctx: AudioContext, master: GainNode) {
  const start = ctx.currentTime + 0.03
  const beatLen =
    spec.kind === 'bpm' ? 60 / spec.bpm : 60 / 120
  const beats = Math.min(32, Math.floor(PREVIEW_SEC / beatLen))
  const base = spec.kind === 'mood' ? moodBaseHz[spec.id] || 220 : 247

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(9000, start)
  filter.Q.setValueAtTime(0.7, start)
  filter.connect(master)

  const drumGain = ctx.createGain()
  drumGain.gain.value = 0.45
  drumGain.connect(filter)

  const melGain = ctx.createGain()
  melGain.gain.value = 0.35
  melGain.connect(filter)

  switch (spec.kind) {
    case 'mood': {
      const hz = moodBaseHz[spec.id] || 220
      for (let b = 0; b < beats; b += 1) {
        const t = start + b * beatLen
        const phase = b / Math.max(1, beats - 1)
        if (spec.id === 'ambient') {
          scheduleTone(ctx, melGain, hz * (1 + phase * 0.02), t, t + beatLen * 1.2, 0.08, 'sine', sources)
        } else if (spec.id === 'energetic') {
          if (b % 2 === 0) scheduleKick(ctx, drumGain, t, 0.4, sources)
          scheduleTone(ctx, melGain, hz * Math.pow(2, (b % 5) / 12), t, t + beatLen * 0.5, 0.07, 'square', sources)
        } else if (spec.id === 'dark') {
          filter.frequency.setValueAtTime(2800 - phase * 400, t)
          if (b % 4 === 0) scheduleKick(ctx, drumGain, t, 0.45, sources)
          scheduleTone(ctx, melGain, hz * 0.5, t, t + beatLen * 0.9, 0.1, 'sawtooth', sources)
        } else {
          if (b % 4 === 0) scheduleKick(ctx, drumGain, t, 0.28, sources)
          scheduleTone(ctx, melGain, hz, t, t + beatLen * 0.85, 0.06, 'triangle', sources)
        }
      }
      break
    }
    case 'instrument': {
      const id = spec.id
      const wave: OscillatorType =
        id === 'violin' ? 'triangle' : id === 'guitar' ? 'sawtooth' : id === 'piano' ? 'square' : 'sine'
      if (id === 'drums') {
        for (let b = 0; b < beats; b += 1) {
          const t = start + b * beatLen
          if (b % 2 === 0) scheduleKick(ctx, master, t, 0.42, sources)
          if (b % 2 === 1) scheduleHat(ctx, master, t, 40, sources)
        }
      } else if (id === 'bass') {
        for (let b = 0; b < beats; b += 1) {
          const t = start + b * beatLen
          scheduleTone(
            ctx,
            master,
            base * 0.5 * Math.pow(2, (b % 4) / 12),
            t,
            t + beatLen * 0.92,
            0.12,
            'sawtooth',
            sources
          )
        }
      } else {
        for (let b = 0; b < beats; b += 1) {
          const t = start + b * beatLen
          scheduleTone(
            ctx,
            master,
            base * Math.pow(2, ((b * 2) % 7) / 12),
            t,
            t + beatLen * 0.65,
            0.08,
            wave,
            sources
          )
        }
      }
      break
    }
    case 'melody': {
      const density = spec.id === 'minimal' ? 0.35 : spec.id === 'complex' ? 0.95 : 0.65
      const steps =
        spec.id === 'complex'
          ? [0, 2, 3, 5, 7, 10]
          : spec.id === 'melodic'
            ? [0, 2, 4, 7, 9]
            : [0, 3, 5, 7]
      const idHash = spec.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      for (let b = 0; b < beats; b += 1) {
        const pseudo = ((b * 17 + idHash) % 1000) / 1000
        if (pseudo > density) continue
        const t = start + b * beatLen
        const st = steps[b % steps.length]
        scheduleTone(ctx, master, base * Math.pow(2, st / 12), t, t + beatLen * 0.55, 0.07, 'triangle', sources)
      }
      break
    }
    case 'bassline': {
      const pat =
        spec.id === 'walking'
          ? [0, 2, 4, 5]
          : spec.id === 'punchy'
            ? [0, 7, 0, 10]
            : spec.id === 'sub'
              ? [0, -5, 0, -7]
              : [0, 0, 0, 0]
      for (let b = 0; b < beats; b += 1) {
        const t = start + b * beatLen
        const off = pat[b % pat.length]
        scheduleTone(
          ctx,
          master,
          (base / 2) * Math.pow(2, off / 12),
          t,
          t + beatLen * 0.9,
          spec.id === 'sub' ? 0.14 : 0.09,
          'sawtooth',
          sources
        )
      }
      break
    }
    case 'drum': {
      const id = spec.id
      for (let b = 0; b < beats; b += 1) {
        const t = start + b * beatLen
        const kick =
          id === 'four-on-floor'
            ? true
            : id === 'breakbeat'
              ? b % 8 === 0 || b % 8 === 3 || b % 8 === 6
              : id === 'trap'
                ? b % 4 === 0
                : id === 'minimal'
                  ? b % 8 === 0
                  : b % 4 === 0 || b % 4 === 2
        if (kick) scheduleKick(ctx, master, t, 0.38, sources)
        const hat = id === 'trap' ? true : id === 'minimal' ? b % 4 === 2 : b % 2 === 1
        if (hat) scheduleHat(ctx, master, t, id === 'trap' ? 70 : 35, sources)
      }
      break
    }
    case 'bpm': {
      for (let b = 0; b < beats; b += 1) {
        const t = start + b * beatLen
        if (b % 2 === 0) scheduleKick(ctx, master, t, 0.36, sources)
        scheduleTone(ctx, master, base * Math.pow(2, (b % 5) / 12), t, t + beatLen * 0.4, 0.05, 'sine', sources)
      }
      break
    }
    case 'excitement': {
      const e = spec.value / 100
      filter.frequency.setValueAtTime(1200 + e * 10000, start)
      for (let b = 0; b < beats; b += 1) {
        const t = start + b * beatLen
        const phase = b / beats
        if (b % 2 === 0) scheduleKick(ctx, drumGain, t, 0.3 + e * 0.2, sources)
        if (e > 0.45 && b % 2 === 1) scheduleHat(ctx, drumGain, t, 20 + e * 60, sources)
        const pick = ((b * 19 + Math.floor(e * 100)) % 1000) / 1000
        if (pick < 0.4 + e * 0.5) {
          scheduleTone(
            ctx,
            melGain,
            base * Math.pow(2, ((b + Math.floor(phase * 4)) % 8) / 12),
            t,
            t + beatLen * (0.45 + e * 0.35),
            0.04 + e * 0.06,
            e > 0.55 ? 'sawtooth' : 'triangle',
            sources
          )
        }
      }
      break
    }
    case 'prompt': {
      for (let b = 0; b < beats; b += 1) {
        const t = start + b * beatLen
        scheduleTone(ctx, master, base * Math.pow(2, (b % 6) / 12), t, t + beatLen * 0.5, 0.05, 'sine', sources)
        if (b % 3 === 0) {
          scheduleTone(
            ctx,
            master,
            (base / 2) * Math.pow(2, (b % 3) / 12),
            t,
            t + beatLen * 0.7,
            0.06,
            'triangle',
            sources
          )
        }
      }
      break
    }
    case 'vibe': {
      const id = spec.id
      const isOceanic = id === 'oceanic'
      const isGritty = id === 'gritty'
      const isEthereal = id === 'ethereal'
      for (let b = 0; b < beats; b += 1) {
        const t = start + b * beatLen
        if (!isGritty || b % 2 === 0) {
          scheduleKick(ctx, master, t, isGritty ? 0.48 : 0.3, sources)
        }
        if (isOceanic || isEthereal) {
          scheduleHat(ctx, master, t + beatLen * 0.15, isOceanic ? 15 : 55, sources)
        }
        if (isOceanic && b % 2 === 0) {
          const n = Math.floor(ctx.sampleRate * 0.08)
          const buf = ctx.createBuffer(1, n, ctx.sampleRate)
          const d = buf.getChannelData(0)
          for (let i = 0; i < n; i += 1) d[i] = (Math.random() * 2 - 1) * 0.5
          const src = ctx.createBufferSource()
          const bp = ctx.createBiquadFilter()
          const g = ctx.createGain()
          bp.type = 'bandpass'
          bp.frequency.setValueAtTime(400 + b * 80, t)
          src.buffer = buf
          src.connect(bp)
          bp.connect(g)
          g.connect(master)
          g.gain.setValueAtTime(0.0001, t)
          g.gain.linearRampToValueAtTime(0.045, t + 0.02)
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
          src.start(t)
          src.stop(t + 0.13)
          sources.push(src)
        }
        scheduleTone(
          ctx,
          master,
          base * Math.pow(2, (b % 5) / 12),
          t,
          t + beatLen * (isEthereal ? 0.85 : 0.5),
          isGritty ? 0.09 : 0.05,
          isGritty ? 'sawtooth' : 'triangle',
          sources
        )
      }
      break
    }
    default:
      break
  }
}

/** @returns true if playback started */
export async function playSyntheticPreview(spec: PreviewSpec): Promise<boolean> {
  stopSyntheticPreview()
  const ctx = await ensureCtx()
  if (!ctx) return false
  const master = ctx.createGain()
  master.gain.value = 0.55
  master.connect(ctx.destination)
  playSynthetic(spec, ctx, master)
  stopTimer = window.setTimeout(() => stopSyntheticPreview(), PREVIEW_SEC * 1000 + 80)
  return true
}
