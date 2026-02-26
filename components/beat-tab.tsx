"use client"

import { useState } from "react"
import { Download, Loader2, Music2, Gauge, Mic2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BeatStructure, GenerationInput } from "@/lib/types"

interface BeatTabProps {
  beat: BeatStructure
  input: GenerationInput
}

export function BeatTab({ beat, input }: BeatTabProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch("/api/midi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beat, input }),
      })

      if (!response.ok) throw new Error("Failed to generate MIDI")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "beatAI_project.mid"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Chord Progression */}
      <div className="rounded-xl border border-border/30 bg-secondary/20 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Music2 className="size-4 text-primary" />
          <h3
            className="text-sm font-semibold uppercase tracking-wider text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chord Progression
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {beat.chordProgression.map((chord, i) => (
            <span
              key={i}
              className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground"
            >
              {chord}
            </span>
          ))}
        </div>
      </div>

      {/* BPM & Instruments */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/30 bg-secondary/20 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="size-4 text-accent" />
            <h3
              className="text-sm font-semibold uppercase tracking-wider text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              BPM
            </h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{beat.bpm}</p>
        </div>

        <div className="rounded-xl border border-border/30 bg-secondary/20 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Mic2 className="size-4 text-accent" />
            <h3
              className="text-sm font-semibold uppercase tracking-wider text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Instruments
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {beat.instruments.map((inst, i) => (
              <span
                key={i}
                className="rounded-md bg-accent/10 px-2 py-1 text-xs text-foreground/80"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="rounded-xl border border-border/30 bg-secondary/20 p-5">
        <h3
          className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Section Breakdown
        </h3>
        <div className="flex flex-col gap-3">
          {beat.sections.map((section, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 rounded-lg bg-background/30 p-3"
            >
              <div>
                <p className="font-medium text-foreground">{section.name}</p>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {section.bars} bars
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Download */}
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full gap-2 rounded-xl bg-accent py-5 text-accent-foreground hover:bg-accent/90"
      >
        {isDownloading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating MIDI...
          </>
        ) : (
          <>
            <Download className="size-4" />
            Download MIDI
          </>
        )}
      </Button>
    </div>
  )
}
