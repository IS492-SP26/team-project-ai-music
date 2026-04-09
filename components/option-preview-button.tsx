'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  playOptionPreview,
  stopOptionPreview,
  type PlayPreviewStatus,
  type PreviewSpec,
} from '@/lib/preview-audio'

interface OptionPreviewButtonProps {
  spec: PreviewSpec
  label: string
}

export function OptionPreviewButton({ spec, label }: OptionPreviewButtonProps) {
  const hoverTimer = useRef<number | null>(null)
  const [status, setStatus] = useState<PlayPreviewStatus>('idle')
  const [errorHint, setErrorHint] = useState<string | null>(null)
  const specKey = JSON.stringify(spec)

  useEffect(() => {
    stopOptionPreview()
    setStatus('idle')
    setErrorHint(null)
  }, [specKey])

  const runPreview = useCallback(async () => {
    setErrorHint(null)
    const result = await playOptionPreview(spec, (s) => setStatus(s))
    if (result.status === 'unavailable') {
      setErrorHint(result.message ?? 'Preview unavailable')
      window.setTimeout(() => setErrorHint(null), 4500)
    } else if (result.status === 'playing') {
      setErrorHint(null)
    }
  }, [spec])

  const clearHover = useCallback(() => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }, [])

  const onHoverStart = useCallback(() => {
    clearHover()
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null
      void runPreview()
    }, 420)
  }, [clearHover, runPreview])

  const onHoverEnd = useCallback(() => {
    clearHover()
    stopOptionPreview()
    setStatus('idle')
  }, [clearHover])

  return (
    <div className="flex min-w-[4.5rem] flex-col items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
        aria-label={`Preview ${label} (short sample)`}
        title="Preview — tries your audio file first, then a built-in demo"
        onClick={() => {
          clearHover()
          void runPreview()
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
      >
        <Headphones className="h-4 w-4" aria-hidden />
      </Button>
      {status === 'loading' && (
        <p className="text-center text-[10px] leading-tight text-muted-foreground">Loading…</p>
      )}
      {errorHint && (
        <div
          className="max-w-[8rem] rounded-md border border-destructive/25 bg-destructive/10 px-1.5 py-1 text-center text-[10px] leading-snug text-destructive"
          role="status"
        >
          {errorHint}
        </div>
      )}
    </div>
  )
}
