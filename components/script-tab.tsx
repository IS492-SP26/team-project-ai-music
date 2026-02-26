"use client"

import type { SongScript } from "@/lib/types"

interface ScriptTabProps {
  script: SongScript
}

const sections = [
  { key: "intro" as const, label: "Intro" },
  { key: "verse1" as const, label: "Verse 1" },
  { key: "chorus" as const, label: "Chorus" },
  { key: "verse2" as const, label: "Verse 2" },
  { key: "bridge" as const, label: "Bridge" },
  { key: "outro" as const, label: "Outro" },
]

export function ScriptTab({ script }: ScriptTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <div
          key={section.key}
          className="rounded-xl border border-border/30 bg-secondary/20 p-5"
        >
          <h3
            className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {section.label}
          </h3>
          <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
            {script[section.key]}
          </p>
        </div>
      ))}
    </div>
  )
}
