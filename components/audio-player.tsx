'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX, Cloud, Sparkles, Drum } from 'lucide-react'
import { getVibeMix } from '@/lib/vibe-presets'
import { createSoundscapeFx, scheduleSoundscape } from '@/lib/soundscape-engine'

interface AudioPlayerProps {
  title?: string
  settings?: {
    prompt: string
    mood: string
    bpm: number
    instruments: string[]
    melody: string
    bassline: string
    drumPattern: string
    excitement: number
    vibe: string
  }
}

export function AudioPlayer({ title = 'Generated Track', settings }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const durationSec = 30
  const progressIntervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const stopTimeoutRef = useRef<number | null>(null)
  const currentSourcesRef = useRef<AudioScheduledSourceNode[]>([])

  const stopAllSources = () => {
    currentSourcesRef.current.forEach((source) => {
      try {
        source.stop()
      } catch {
        /* noop */
      }
    })
    currentSourcesRef.current = []
  }

  const clearTimers = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
    }
  }

  const generateTrack = async () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return false

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass()
    }
    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    stopAllSources()
    clearTimers()
    setProgress(0)

    if (!masterGainRef.current) {
      masterGainRef.current = ctx.createGain()
      masterGainRef.current.connect(ctx.destination)
    }

    const excitement01 = Math.min(100, Math.max(0, settings?.excitement ?? 50)) / 100
    const vibe = getVibeMix(settings?.vibe, excitement01)
    const baseBpm = settings?.bpm || 120
    const beatLength = (60 / baseBpm) * (1 - 0.05 * excitement01)
    const startTime = ctx.currentTime + 0.06

    const soundscapeSettings = {
      mood: settings?.mood || 'chill',
      bpm: baseBpm,
      instruments: settings?.instruments ?? [],
      melody: settings?.melody || 'simple',
      bassline: settings?.bassline || 'steady',
      drumPattern: settings?.drumPattern || 'four-on-floor',
      excitement: settings?.excitement ?? 50,
      vibe: settings?.vibe || 'default',
      prompt: settings?.prompt || '',
    }

    const { drySum, wetSend, masterFilter } = createSoundscapeFx(ctx, vibe, beatLength, soundscapeSettings)

    masterFilter.disconnect()
    masterFilter.connect(masterGainRef.current)

    scheduleSoundscape({
      ctx,
      startTime,
      durationSec,
      beatLength,
      settings: soundscapeSettings,
      vibe,
      drySum,
      wetSend,
      masterFilter,
      bucket: currentSourcesRef.current,
    })

    const playbackStart = performance.now()
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - playbackStart) / 1000
      const nextProgress = Math.min(100, (elapsed / durationSec) * 100)
      setProgress(nextProgress)
    }, 100)

    stopTimeoutRef.current = window.setTimeout(() => {
      setIsPlaying(false)
      setProgress(0)
      stopAllSources()
      clearTimers()
    }, durationSec * 1000)

    return true
  }

  const togglePlay = async () => {
    if (isPlaying) {
      setIsPlaying(false)
      setProgress(0)
      stopAllSources()
      clearTimers()
      return
    }

    const started = await generateTrack()
    if (started) {
      setIsPlaying(true)
    }
  }
  const toggleMute = () => setIsMuted(!isMuted)

  useEffect(() => {
    const gainNode = masterGainRef.current
    if (!gainNode || !audioContextRef.current) return
    const target = isMuted ? 0 : volume / 100
    gainNode.gain.setTargetAtTime(target, audioContextRef.current.currentTime, 0.02)
  }, [volume, isMuted])

  useEffect(() => {
    return () => {
      stopAllSources()
      clearTimers()
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [])

  const formatTime = (percent: number) => {
    const seconds = Math.floor((percent / 100) * 30)
    return `0:${seconds.toString().padStart(2, '0')}`
  }

  const bars = Array.from({ length: 60 }, (_, i) => {
    const height = Math.sin(i * 0.3) * 30 + Math.random() * 20 + 20
    return height
  })

  const exc = settings?.excitement ?? 50
  const vibeLabel = settings?.vibe || 'default'

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {settings && (
            <p className="text-sm text-muted-foreground">
              {settings.mood} · {vibeLabel} · {settings.bpm} BPM · excitement {exc}% ·{' '}
              {settings.instruments.join(', ')}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground font-mono tabular-nums">
          {formatTime(progress)} / 0:30
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div
          className={`rounded-lg border border-border/80 bg-secondary/30 px-2 py-3 text-center transition-all sm:px-3 ${
            isPlaying ? 'ring-1 ring-primary/40' : ''
          }`}
        >
          <Cloud
            className={`mx-auto mb-2 h-6 w-6 text-primary ${isPlaying ? 'animate-pulse' : 'opacity-70'}`}
            aria-hidden
          />
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Atmosphere</p>
          <p className="mt-1 text-xs text-muted-foreground">Pads &amp; texture</p>
          <div className="mt-2 flex h-8 items-end justify-center gap-0.5">
            {[0.35, 0.6, 0.45, 0.75, 0.5].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-primary/70 transition-all ${isPlaying ? 'animate-pulse' : 'opacity-40'}`}
                style={{
                  height: `${h * 100}%`,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>
        <div
          className={`rounded-lg border border-border/80 bg-secondary/30 px-2 py-3 text-center transition-all sm:px-3 ${
            isPlaying ? 'ring-1 ring-accent/50' : ''
          }`}
        >
          <Sparkles
            className={`mx-auto mb-2 h-6 w-6 text-accent ${isPlaying ? 'animate-pulse' : 'opacity-70'}`}
            aria-hidden
          />
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Melody</p>
          <p className="mt-1 text-xs text-muted-foreground">Glassy lead line</p>
          <div className="mt-2 flex h-8 items-end justify-center gap-0.5">
            {[0.55, 0.4, 0.85, 0.5, 0.7].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-accent/70 transition-all ${isPlaying ? 'animate-pulse' : 'opacity-40'}`}
                style={{
                  height: `${h * 100}%`,
                  animationDelay: `${i * 90 + 40}ms`,
                }}
              />
            ))}
          </div>
        </div>
        <div
          className={`rounded-lg border border-border/80 bg-secondary/30 px-2 py-3 text-center transition-all sm:px-3 ${
            isPlaying ? 'ring-1 ring-primary/40' : ''
          }`}
        >
          <Drum
            className={`mx-auto mb-2 h-6 w-6 text-primary ${isPlaying ? 'animate-pulse' : 'opacity-70'}`}
            aria-hidden
          />
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rhythm</p>
          <p className="mt-1 text-xs text-muted-foreground">Drums &amp; bass</p>
          <div className="mt-2 flex h-8 items-end justify-center gap-0.5">
            {[0.7, 0.45, 0.9, 0.55, 0.65].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-chart-4/90 transition-all ${isPlaying ? 'animate-pulse' : 'opacity-40'}`}
                style={{
                  height: `${h * 100}%`,
                  animationDelay: `${i * 100 + 20}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex h-20 items-center gap-0.5 overflow-hidden rounded-lg bg-secondary/30 px-2">
        {bars.map((height, i) => {
          const isActive = (i / bars.length) * 100 <= progress
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-75 ${
                isActive ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              style={{
                height: `${height}%`,
                opacity: isActive ? 1 : 0.5,
                transform: isPlaying && isActive ? 'scaleY(1.1)' : 'scaleY(1)',
              }}
            />
          )
        })}
      </div>

      <Slider
        value={[progress]}
        onValueChange={([value]) => setProgress(value)}
        max={100}
        step={0.1}
        className="py-1"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="h-12 w-12 shrink-0 rounded-full border-0 bg-primary hover:bg-primary/90"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Play className="h-5 w-5 ml-0.5 text-primary-foreground" />
          )}
        </Button>

        <div className="flex w-full max-w-xs items-center gap-2 sm:w-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([value]) => {
              setVolume(value)
              if (value > 0) setIsMuted(false)
            }}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Full soundscape: chord pads, shimmering lead, swells, and drums run through shared reverb and echo so the
        stereo field feels like a real place. Option previews use unique files under{' '}
        <code className="rounded bg-muted px-1">public/assets/audio/</code> (see{' '}
        <code className="rounded bg-muted px-1">lib/audio-sample-map.ts</code>).
      </p>
    </div>
  )
}
