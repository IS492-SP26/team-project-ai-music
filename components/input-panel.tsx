"use client"

import { useState } from "react"
import { Music, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Mood, Tempo, GenerationInput } from "@/lib/types"

interface InputPanelProps {
  onGenerate: (input: GenerationInput) => void
  isLoading: boolean
}

export function InputPanel({ onGenerate, isLoading }: InputPanelProps) {
  const [topic, setTopic] = useState("")
  const [mood, setMood] = useState<Mood>("happy")
  const [tempo, setTempo] = useState<Tempo>("medium")
  const [includeMelody, setIncludeMelody] = useState(true)
  const [includeBassline, setIncludeBassline] = useState(true)
  const [includeDrumPattern, setIncludeDrumPattern] = useState(true)

  const handleSubmit = () => {
    if (!topic.trim()) return
    onGenerate({
      topic: topic.trim(),
      mood,
      tempo,
      includeMelody,
      includeBassline,
      includeDrumPattern,
    })
  }

  return (
    <div className="flex h-full flex-col gap-6 rounded-2xl border border-border/40 bg-card/50 p-6 backdrop-blur-sm">
      <div>
        <h2
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Your Song
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your song and we will help you create it.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5">
        {/* Topic */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="topic" className="text-sm font-medium text-foreground">
            What is your song about?
          </Label>
          <Textarea
            id="topic"
            placeholder="e.g. A summer road trip with friends, chasing sunsets..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[100px] resize-none rounded-xl border-border/40 bg-secondary/30 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50"
          />
        </div>

        {/* Mood */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="mood" className="text-sm font-medium text-foreground">
            Mood
          </Label>
          <Select value={mood} onValueChange={(v) => setMood(v as Mood)}>
            <SelectTrigger
              id="mood"
              className="w-full rounded-xl border-border/40 bg-secondary/30 text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card text-foreground">
              <SelectItem value="happy">Happy</SelectItem>
              <SelectItem value="sad">Sad</SelectItem>
              <SelectItem value="motivational">Motivational</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="chill">Chill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tempo */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="tempo" className="text-sm font-medium text-foreground">
            Tempo
          </Label>
          <Select value={tempo} onValueChange={(v) => setTempo(v as Tempo)}>
            <SelectTrigger
              id="tempo"
              className="w-full rounded-xl border-border/40 bg-secondary/30 text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card text-foreground">
              <SelectItem value="slow">Slow (70-90 BPM)</SelectItem>
              <SelectItem value="medium">Medium (100-120 BPM)</SelectItem>
              <SelectItem value="fast">Fast (130-150 BPM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Instrument options */}
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-medium text-foreground">
            Include in your beat
          </Label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={includeMelody}
                onCheckedChange={(checked) => setIncludeMelody(checked === true)}
              />
              <span className="text-sm text-foreground">Melody</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={includeBassline}
                onCheckedChange={(checked) => setIncludeBassline(checked === true)}
              />
              <span className="text-sm text-foreground">Bassline</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={includeDrumPattern}
                onCheckedChange={(checked) =>
                  setIncludeDrumPattern(checked === true)
                }
              />
              <span className="text-sm text-foreground">Drum Pattern</span>
            </label>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!topic.trim() || isLoading}
        className="w-full gap-2 rounded-xl bg-primary py-6 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating your beat...
          </>
        ) : (
          <>
            <Music className="size-4" />
            Generate Script & Beat
          </>
        )}
      </Button>
    </div>
  )
}
