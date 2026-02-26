"use client"

import { FileText, Music, GraduationCap, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScriptTab } from "@/components/script-tab"
import { BeatTab } from "@/components/beat-tab"
import { LearningTab } from "@/components/learning-tab"
import type { GenerationResult, GenerationInput, GenerateGroqResponse } from "@/lib/types"

interface OutputPanelProps {
  result: GenerationResult | GenerateGroqResponse | null
  input: GenerationInput | null
  isLoading: boolean
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-border/40 bg-card/50 p-8 text-center backdrop-blur-sm">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="size-8 text-primary" />
      </div>
      <div>
        <h3
          className="mb-2 text-lg font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Your creation will appear here
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Fill in the details on the left and hit generate. The AI will create a
          song script, beat structure, and explain every choice it makes.
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-border/40 bg-card/50 p-8 text-center backdrop-blur-sm">
      <div className="relative">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Music className="size-8 animate-pulse text-primary" />
        </div>
        <div className="absolute -inset-2 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </div>
      <div>
        <h3
          className="mb-2 text-lg font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Generating your beat...
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          The AI is writing lyrics, building a chord progression, choosing a
          tempo, and preparing explanations just for you.
        </p>
      </div>
    </div>
  )
}

function isGroqResult(result: GenerationResult | GenerateGroqResponse): result is GenerateGroqResponse {
  return "result" in result && typeof (result as GenerateGroqResponse).result === "string"
}

export function OutputPanel({ result, input, isLoading }: OutputPanelProps) {
  if (isLoading) return <LoadingState />
  if (!result || !input) return <EmptyState />

  if (isGroqResult(result)) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border/40 bg-card/50 p-6 backdrop-blur-sm">
        <h3
          className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Song script & beat plan
        </h3>
        <div className="flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg bg-secondary/20 p-4 text-sm text-foreground">
          {result.result}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
      <Tabs defaultValue="script" className="flex h-full flex-col">
        <div className="border-b border-border/30 px-4 pt-4">
          <TabsList className="w-full rounded-xl bg-secondary/40">
            <TabsTrigger
              value="script"
              className="gap-1.5 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <FileText className="size-3.5" />
              <span className="hidden sm:inline">Song Script</span>
              <span className="sm:hidden">Script</span>
            </TabsTrigger>
            <TabsTrigger
              value="beat"
              className="gap-1.5 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Music className="size-3.5" />
              <span className="hidden sm:inline">Beat Structure</span>
              <span className="sm:hidden">Beat</span>
            </TabsTrigger>
            <TabsTrigger
              value="learn"
              className="gap-1.5 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <GraduationCap className="size-3.5" />
              <span className="hidden sm:inline">Learning Mode</span>
              <span className="sm:hidden">Learn</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="script" className="mt-0">
            <ScriptTab script={result.songScript} />
          </TabsContent>
          <TabsContent value="beat" className="mt-0">
            <BeatTab beat={result.beatStructure} input={input} />
          </TabsContent>
          <TabsContent value="learn" className="mt-0">
            <LearningTab learning={result.learning} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
