import type { VibeMix } from '@/lib/vibe-presets'
import { moodBaseHz, scheduleHat, scheduleKick, scheduleTone } from '@/lib/web-audio-helpers'

/** Four-bar chord roots as semitones from the song tonic (not necessarily strict functional harmony). */
const PROGRESSIONS: number[][] = [
  [0, 5, 7, 9],
  [0, 7, 9, 5],
  [0, 5, 0, 7],
  [0, 9, 5, 7],
  [0, 3, 8, 7],
  [0, 5, 2, 7],
  [0, 10, 5, 9],
  [0, 4, 7, 11],
  [0, 8, 3, 10],
  [0, 7, 5, 10],
  [0, 5, 9, 4],
  [0, 2, 7, 5],
]

/** Pad chord qualities (semitones above root). */
const TRIADS: number[][] = [
  [0, 4, 7],
  [0, 3, 7],
  [0, 5, 7],
  [0, 4, 9],
]

export interface SoundscapeSettings {
  mood: string
  bpm: number
  instruments: string[]
  melody: string
  bassline: string
  drumPattern: string
  excitement: number
  vibe: string
  prompt: string
}

export function buildSongSignature(settings: SoundscapeSettings): string {
  return [
    settings.prompt.trim(),
    settings.mood,
    String(settings.bpm),
    settings.vibe,
    String(settings.excitement),
    [...settings.instruments].sort().join(','),
    settings.melody,
    settings.bassline,
    settings.drumPattern,
  ].join('\u241e')
}

function hashString(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return hash >>> 0
}

function makePrng(seedValue: number) {
  let seed = seedValue || 123456789
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function rotateArray<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr
  const o = ((offset % arr.length) + arr.length) % arr.length
  return [...arr.slice(o), ...arr.slice(0, o)]
}

function generateImpulse(ctx: AudioContext, duration: number, decay: number, rng: () => number) {
  const rate = ctx.sampleRate
  const length = rate * duration
  const impulse = ctx.createBuffer(2, length, rate)
  for (let channel = 0; channel < 2; channel += 1) {
    const ch = impulse.getChannelData(channel)
    for (let i = 0; i < length; i += 1) {
      const t = i / length
      ch[i] = (rng() * 2 - 1) * Math.pow(1 - t, decay)
    }
  }
  return impulse
}

function connectDryWet(
  source: AudioNode,
  dryBus: AudioNode,
  wetBus: AudioNode,
  wetAmt: number
) {
  const dryG = source.context.createGain()
  const wetG = source.context.createGain()
  const w = Math.min(1, Math.max(0, wetAmt))
  dryG.gain.value = 1 - w * 0.62
  wetG.gain.value = w * 0.52
  source.connect(dryG)
  source.connect(wetG)
  dryG.connect(dryBus)
  wetG.connect(wetBus)
}

function schedulePadLayer(
  ctx: AudioContext,
  padBus: GainNode,
  rootHz: number,
  start: number,
  duration: number,
  attack: number,
  semitonesTriad: number[],
  bucket: AudioScheduledSourceNode[],
  extraVoice: boolean
) {
  const voices = extraVoice ? [...semitonesTriad, 10] : semitonesTriad
  for (const st of voices) {
    const f = rootHz * Math.pow(2, st / 12)
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, start)
    osc.connect(g)
    g.connect(padBus)
    g.gain.setValueAtTime(0.0001, start)
    g.gain.linearRampToValueAtTime(0.042, start + attack)
    g.gain.setValueAtTime(0.038, start + duration - 0.5)
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.start(start)
    osc.stop(start + duration + 0.05)
    bucket.push(osc)
  }
}

function scheduleGlassLead(
  ctx: AudioContext,
  leadBus: GainNode,
  freq: number,
  start: number,
  dur: number,
  gain: number,
  shimmer: number,
  bucket: AudioScheduledSourceNode[]
) {
  const detune = shimmer * 14
  const o1 = ctx.createOscillator()
  const o2 = ctx.createOscillator()
  const og = ctx.createGain()
  o1.type = 'sine'
  o2.type = 'sine'
  o1.frequency.setValueAtTime(freq, start)
  o2.frequency.setValueAtTime(freq * Math.pow(2, detune / 1200), start)
  o1.connect(og)
  o2.connect(og)
  og.connect(leadBus)
  og.gain.setValueAtTime(0.0001, start)
  og.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), start + 0.015)
  og.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o1.start(start)
  o2.start(start)
  o1.stop(start + dur + 0.02)
  o2.stop(start + dur + 0.02)
  bucket.push(o1, o2)
}

function scheduleTextureGrain(
  ctx: AudioContext,
  texBus: GainNode,
  start: number,
  dur: number,
  strength: number,
  centerDark: number,
  bucket: AudioScheduledSourceNode[],
  rng: () => number
) {
  const rate = ctx.sampleRate
  const n = Math.floor(rate * dur)
  const buf = ctx.createBuffer(1, n, rate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i += 1) {
    d[i] = (rng() * 2 - 1) * 0.85
  }
  const src = ctx.createBufferSource()
  const bp = ctx.createBiquadFilter()
  const g = ctx.createGain()
  bp.type = 'bandpass'
  const f0 = 280 + (1 - centerDark) * 2200
  bp.frequency.setValueAtTime(f0 * 0.6, start)
  bp.frequency.exponentialRampToValueAtTime(f0 * 1.4, start + dur * 0.7)
  bp.Q.setValueAtTime(0.45, start)
  src.buffer = buf
  src.connect(bp)
  bp.connect(g)
  g.connect(texBus)
  const peak = 0.06 + strength * 0.1
  g.gain.setValueAtTime(0.0001, start)
  g.gain.linearRampToValueAtTime(peak, start + dur * 0.35)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.start(start)
  src.stop(start + dur)
  bucket.push(src)
}

export function createSoundscapeFx(
  ctx: AudioContext,
  vibe: VibeMix,
  beatLength: number,
  settings: SoundscapeSettings
) {
  const drySum = ctx.createGain()
  const wetSend = ctx.createGain()
  wetSend.gain.value = 0.92

  const impulseRng = makePrng(hashString(`${buildSongSignature(settings)}|convolver`))
  const convolver = ctx.createConvolver()
  convolver.buffer = generateImpulse(ctx, Math.min(4.5, 1.2 + vibe.reverbTail), 2.4, impulseRng)

  const convWet = ctx.createGain()
  convWet.gain.value = 0.72
  const delay = ctx.createDelay(1.0)
  const dt = Math.min(0.55, beatLength * vibe.delayBeatFraction)
  delay.delayTime.setValueAtTime(dt, ctx.currentTime)

  const delOut = ctx.createGain()
  delOut.gain.value = 0.55
  const delFb = ctx.createGain()
  delFb.gain.value = vibe.delayFeedback

  wetSend.connect(convolver)
  convolver.connect(convWet)

  wetSend.connect(delay)
  delay.connect(delOut)
  delay.connect(delFb)
  delFb.connect(delay)

  const wetMerge = ctx.createGain()
  wetMerge.gain.value = 0.85
  convWet.connect(wetMerge)
  delOut.connect(wetMerge)

  const masterFilter = ctx.createBiquadFilter()
  masterFilter.type = 'lowpass'
  masterFilter.Q.setValueAtTime(0.72, ctx.currentTime)

  drySum.connect(masterFilter)
  wetMerge.connect(masterFilter)

  return { drySum, wetSend, masterFilter, wetMerge }
}

function splitLayer(
  ctx: AudioContext,
  drySum: AudioNode,
  wetSend: AudioNode,
  wetAmt: number
): GainNode {
  const bus = ctx.createGain()
  connectDryWet(bus, drySum, wetSend, wetAmt)
  return bus
}

export function scheduleSoundscape(params: {
  ctx: AudioContext
  startTime: number
  durationSec: number
  beatLength: number
  settings: SoundscapeSettings
  vibe: VibeMix
  drySum: AudioNode
  wetSend: AudioNode
  masterFilter: BiquadFilterNode
  bucket: AudioScheduledSourceNode[]
}) {
  const {
    ctx,
    startTime,
    durationSec,
    beatLength,
    settings,
    vibe,
    drySum,
    wetSend,
    masterFilter,
    bucket,
  } = params

  const excitement = Math.min(100, Math.max(0, settings.excitement)) / 100

  const signature = buildSongSignature(settings)

  const h0 = hashString(signature)
  const h1 = hashString(`${signature}|melody`)
  const h2 = hashString(`${signature}|rhythm`)
  const h3 = hashString(`${signature}|pad`)
  const random = makePrng(h0 ^ h1)
  const texRng = makePrng(h3)

  /** ±9 semitones from mood anchor — same mood + different prompt = different key. */
  const transposeSemi = (h0 % 19) - 9
  const moodRoot = moodBaseHz[settings.mood] || 220
  const baseFrequency = moodRoot * Math.pow(2, transposeSemi / 12)

  const progression = PROGRESSIONS[h0 % PROGRESSIONS.length]
  const progRotate = h2 % progression.length
  const rotatedProg = rotateArray(progression, progRotate)
  const triad = TRIADS[h1 % TRIADS.length]

  const melodyScales: Record<string, number[]> = {
    simple: [0, 3, 5, 7],
    complex: [0, 2, 3, 5, 7, 10, 12, 14],
    minimal: [0, 5, 7],
    melodic: [0, 2, 4, 7, 9, 12],
  }
  const baseScale = [...(melodyScales[settings.melody] || melodyScales.simple)]
  const colorSemitone = (h1 >> 3) % 12
  if ((h1 >> 7) % 2 === 0) {
    baseScale.push(colorSemitone)
  }
  const melodyScale = rotateArray(baseScale, h1 % baseScale.length)

  const bassPatternOffsets: Record<string, number[]> = {
    steady: [0, 0, 0, 0],
    walking: [0, 2, 4, 5],
    punchy: [0, 7, 0, 10],
    sub: [0, -5, 0, -7],
  }
  const bassPattern = bassPatternOffsets[settings.bassline] || bassPatternOffsets.steady

  const instrumentSet = new Set(settings.instruments)
  const bassWave: OscillatorType = instrumentSet.has('bass') ? 'sawtooth' : 'sine'
  const hasDrums = instrumentSet.has('drums')
  const hasLead =
    instrumentSet.has('synth') ||
    instrumentSet.has('piano') ||
    instrumentSet.has('guitar') ||
    instrumentSet.has('violin')

  const rhythmBus = splitLayer(ctx, drySum, wetSend, vibe.wetRhythm)
  const bassBus = splitLayer(ctx, drySum, wetSend, vibe.wetBass)
  const padBus = splitLayer(ctx, drySum, wetSend, vibe.wetPad)
  const leadBus = splitLayer(ctx, drySum, wetSend, vibe.wetLead)
  const texBus = splitLayer(ctx, drySum, wetSend, vibe.wetTexture)

  const totalBeats = Math.floor(durationSec / beatLength)
  const beatsPerBar = 4
  let variationStep = 0

  const leadOctaveMul = 2 + (h1 % 3)
  const drumPhase = h2 % 3

  const fLow = (520 + excitement * 2200 + (h0 % 200)) * vibe.brightnessScale
  const fHigh = (1700 + excitement * 9200 + (h3 % 400)) * vibe.brightnessScale
  masterFilter.frequency.setValueAtTime(fLow, startTime)
  masterFilter.frequency.exponentialRampToValueAtTime(Math.max(fHigh, fLow + 120), startTime + durationSec)

  for (let beat = 0; beat < totalBeats; beat += 1) {
    const bar = Math.floor(beat / beatsPerBar)
    const beatInBar = beat % beatsPerBar
    const phase = beat / Math.max(1, totalBeats - 1)

    if (bar > 0 && bar % 4 === 0 && beatInBar === 0) {
      variationStep += 1
      const bump = 450 + variationStep * 180 + excitement * 400 + (h2 % 150)
      const t = startTime + beat * beatLength
      masterFilter.frequency.setTargetAtTime(Math.min(14000, fLow + bump), t, 0.12)
    }

    if (bar > 0 && bar % 8 === 0 && beatInBar === 0) {
      const t = startTime + beat * beatLength
      masterFilter.frequency.exponentialRampToValueAtTime(
        Math.min(16000, fHigh * (0.92 + variationStep * 0.04)),
        t + durationSec * 0.15
      )
    }

    const chordIdx = Math.floor(bar / 2) % rotatedProg.length
    const chordRootSemi = rotatedProg[chordIdx]
    const chordRootHz = baseFrequency * Math.pow(2, chordRootSemi / 12)

    const beatStart = startTime + beat * beatLength
    const morph = Math.floor(phase * 12) + variationStep

    if (beat % 8 === 0) {
      const padDuration = beatLength * 7.5
      const extraVoicing = variationStep >= 1
      schedulePadLayer(
        ctx,
        padBus,
        chordRootHz,
        beatStart,
        padDuration,
        vibe.padAttack * (0.85 + excitement * 0.25),
        triad,
        bucket,
        extraVoicing
      )
    }

    if (beat % 4 === 0) {
      const grainLen = beatLength * (2.8 + random() * 2.8 + (h3 % 5) * 0.05)
      scheduleTextureGrain(
        ctx,
        texBus,
        beatStart,
        grainLen,
        vibe.textureStrength * (0.65 + excitement * 0.45),
        vibe.textureDarkness,
        bucket,
        texRng
      )
    }

    const drumId = settings.drumPattern
    if (hasDrums) {
      const b = beat + morph + drumPhase
      const shouldKick =
        drumId === 'four-on-floor'
          ? true
          : drumId === 'breakbeat'
            ? b % 8 === 0 || b % 8 === 3 || b % 8 === 6
            : drumId === 'trap'
              ? beat % 4 === 0
              : drumId === 'minimal'
                ? beat % 8 === 0
                : beat % 4 === 0 || beat % 4 === 2
      const kickPunch = 0.26 + excitement * 0.15 + variationStep * 0.02 + (h2 % 8) * 0.004
      if (shouldKick) scheduleKick(ctx, rhythmBus, beatStart, kickPunch, bucket)

      const shouldHat =
        drumId === 'trap' ? true : drumId === 'minimal' ? beat % 4 === 2 : beat % 2 === 1
      const hatBright = 24 + phase * 40 + excitement * 50 + variationStep * 6 + (h2 % 25)
      if (shouldHat) scheduleHat(ctx, rhythmBus, beatStart, hatBright, bucket)
      if (excitement > 0.52 && beat % 3 === 0) {
        scheduleHat(ctx, rhythmBus, beatStart + beatLength * 0.33, hatBright + 12, bucket)
      }
      if ((h2 >> 5) % 3 === 0 && beat % 5 === 2) {
        scheduleHat(ctx, rhythmBus, beatStart + beatLength * 0.66, hatBright + 8, bucket)
      }
    }

    const bassOffsetSemi = bassPattern[beat % bassPattern.length]
    const bassOctaveNudge = (h2 >> 9) % 2 === 0 ? 1 : 0.5
    const bassHz = (chordRootHz / 2) * bassOctaveNudge * Math.pow(2, bassOffsetSemi / 12)
    scheduleTone(
      ctx,
      bassBus,
      bassHz,
      beatStart,
      beatStart + beatLength * (0.88 + phase * 0.06),
      settings.bassline === 'sub' ? 0.1 + excitement * 0.035 : 0.065 + excitement * 0.028,
      bassWave,
      bucket
    )

    if (hasLead) {
      const melodyDensity =
        settings.melody === 'minimal'
          ? 0.28
          : settings.melody === 'complex'
            ? 0.9
            : 0.55
      const density = Math.min(
        0.98,
        melodyDensity + phase * 0.2 + excitement * 0.22 + variationStep * 0.04
      )
      if (random() < density) {
        const st = melodyScale[(beat + bar + morph + (h1 % 3)) % melodyScale.length]
        const leap = (h0 >> (beat % 5)) % 3 === 0 ? 12 : 0
        const leadRoot = chordRootHz * Math.pow(2, (st + leap) / 12) * leadOctaveMul
        const noteLen =
          beatLength *
          (settings.melody === 'complex' ? 0.35 + phase * 0.14 + random() * 0.08 : 0.55 - phase * 0.08)
        scheduleGlassLead(
          ctx,
          leadBus,
          leadRoot,
          beatStart,
          noteLen,
          0.045 + random() * 0.032 + excitement * 0.028,
          vibe.leadShimmer + excitement * 0.04 + (h1 % 5) * 0.01,
          bucket
        )
      }
    }

    if (variationStep >= 2 && beat % 6 === 0 && hasLead) {
      const highBell = chordRootHz * Math.pow(2, (12 + melodyScale[beat % melodyScale.length]) / 12) * (1.5 + (h0 % 3) * 0.25)
      scheduleGlassLead(
        ctx,
        leadBus,
        highBell,
        beatStart,
        beatLength * 0.28,
        0.028,
        vibe.leadShimmer * 1.2,
        bucket
      )
    }
  }
}
