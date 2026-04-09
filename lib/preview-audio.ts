import {
  AUDIO_SAMPLES_BASE,
  buildSampleUrl,
  resolveSampleForPreview,
  validateAudioSampleMap,
  type ResolvedAudioSample,
} from '@/lib/audio-sample-map'
import type { PreviewSpec } from '@/lib/preview-spec'
import { playSyntheticPreview, stopSyntheticPreview } from '@/lib/preview-synthetic'

export type { PreviewSpec } from '@/lib/preview-spec'

const PREVIEW_SEC = 5

let audioEl: HTMLAudioElement | null = null
let stopTimer: number | null = null
let validationLogged = false

function clearTimer() {
  if (stopTimer !== null) {
    window.clearTimeout(stopTimer)
    stopTimer = null
  }
}

export function stopOptionPreview() {
  stopSyntheticPreview()
  if (audioEl) {
    audioEl.pause()
    audioEl.removeAttribute('src')
    audioEl.load()
    audioEl = null
  }
  clearTimer()
}

function ensureMapValidatedOnce() {
  if (validationLogged) return
  validationLogged = true
  if (typeof window === 'undefined') return
  const { ok, duplicates } = validateAudioSampleMap()
  if (!ok) {
    console.warn(
      '[audio-sample-map] Duplicate file paths detected — two options point at the same sample:',
      duplicates
    )
  }
}

export type PlayPreviewStatus = 'idle' | 'loading' | 'playing' | 'unavailable'

export interface PlayPreviewResult {
  status: PlayPreviewStatus
  /** High-quality file from disk when present; otherwise built-in Web Audio. */
  source: 'file' | 'synthetic' | null
  attemptedUrls: string[]
  optionKey: string | null
  category: string | null
  message: string | null
}

function swapExtension(file: string, ext: 'mp3' | 'wav'): string {
  return file.replace(/\.(mp3|wav)$/i, `.${ext}`)
}

/**
 * Tries the mapped MP3/WAV first; if missing, plays a distinct built-in Web Audio preview for that option.
 */
export async function playOptionPreview(
  spec: PreviewSpec,
  onStatus?: (s: PlayPreviewStatus) => void
): Promise<PlayPreviewResult> {
  ensureMapValidatedOnce()
  stopOptionPreview()
  onStatus?.('loading')

  const resolved = resolveSampleForPreview(spec)
  if (!resolved) {
    const msg = 'Preview unavailable (coming soon).'
    console.error('[preview] No sample mapping for spec:', spec)
    onStatus?.('unavailable')
    return {
      status: 'unavailable',
      source: null,
      attemptedUrls: [],
      optionKey: null,
      category: null,
      message: msg,
    }
  }

  const cacheBust = Date.now()
  const attemptedUrls: string[] = []

  const tryUrl = (url: string): Promise<boolean> =>
    new Promise((resolve) => {
      attemptedUrls.push(url)
      const el = new Audio()
      let settled = false
      const done = (ok: boolean) => {
        if (settled) return
        settled = true
        resolve(ok)
      }

      /* Missing files are expected until you add MP3s; avoid console noise. */
      const onErr = () => {
        done(false)
      }

      el.addEventListener(
        'canplay',
        () => {
          stopOptionPreview()
          audioEl = el
          el.currentTime = 0
          void el
            .play()
            .then(() => done(true))
            .catch(() => {
              done(false)
            })
        },
        { once: true }
      )
      el.addEventListener('error', onErr, { once: true })
      el.src = url
      el.load()

      window.setTimeout(() => {
        if (!settled && el.readyState < 2) {
          done(false)
        }
      }, 2200)
    })

  const relMp3 = resolved.relativeFile.endsWith('.mp3')
    ? resolved.relativeFile
    : `${resolved.relativeFile.replace(/\.wav$/i, '')}.mp3`
  const basePathMp3 = relMp3
  const basePathWav = swapExtension(basePathMp3, 'wav')

  const urlMp3 = buildSampleUrl(basePathMp3, cacheBust)
  const urlWav = buildSampleUrl(basePathWav, cacheBust)

  const finishFile = () => {
    onStatus?.('playing')
    clearTimer()
    stopTimer = window.setTimeout(() => {
      stopOptionPreview()
      onStatus?.('idle')
    }, PREVIEW_SEC * 1000 + 50)
  }

  if (await tryUrl(urlMp3)) {
    finishFile()
    return {
      status: 'playing',
      source: 'file',
      attemptedUrls,
      optionKey: resolved.optionKey,
      category: resolved.category,
      message: null,
    }
  }

  if (await tryUrl(urlWav)) {
    finishFile()
    return {
      status: 'playing',
      source: 'file',
      attemptedUrls,
      optionKey: resolved.optionKey,
      category: resolved.category,
      message: null,
    }
  }

  const syntheticOk = await playSyntheticPreview(spec)
  if (syntheticOk) {
    onStatus?.('playing')
    /* Synthetic preview stops itself; then reset UI */
    clearTimer()
    stopTimer = window.setTimeout(() => {
      stopOptionPreview()
      onStatus?.('idle')
    }, PREVIEW_SEC * 1000 + 120)
    return {
      status: 'playing',
      source: 'synthetic',
      attemptedUrls,
      optionKey: resolved.optionKey,
      category: resolved.category,
      message: null,
    }
  }

  console.error('[preview] Built-in preview could not start (Web Audio unavailable?)')
  onStatus?.('unavailable')
  return {
    status: 'unavailable',
    source: null,
    attemptedUrls,
    optionKey: resolved.optionKey,
    category: resolved.category,
    message: 'Preview unavailable.',
  }
}

export function getResolvedSampleForDev(spec: PreviewSpec): ResolvedAudioSample | null {
  return resolveSampleForPreview(spec)
}
