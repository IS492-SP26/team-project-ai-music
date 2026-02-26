"use client"

import { Lightbulb, Music, Timer, Drum, LayoutList } from "lucide-react"
import type { LearningExplanation } from "@/lib/types"

interface LearningTabProps {
  learning: LearningExplanation
}

const explanations = [
  {
    key: "chords" as const,
    icon: Music,
    title: "Why these chords?",
  },
  {
    key: "tempo" as const,
    icon: Timer,
    title: "Why this tempo?",
  },
  {
    key: "drums" as const,
    icon: Drum,
    title: "What the drums are doing",
  },
  {
    key: "structure" as const,
    icon: LayoutList,
    title: "How the song builds",
  },
]

export function LearningTab({ learning }: LearningTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-4">
        <Lightbulb className="size-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground/80">
          Here is a simple breakdown of the musical choices made for your song.
          No jargon — just plain explanations to help you learn.
        </p>
      </div>

      {explanations.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-border/30 bg-secondary/20 p-5"
        >
          <div className="mb-2 flex items-center gap-2">
            <item.icon className="size-4 text-primary" />
            <h3
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {item.title}
            </h3>
          </div>
          <p className="leading-relaxed text-foreground/80">
            {learning[item.key]}
          </p>
        </div>
      ))}
    </div>
  )
}
