"use client"

import { useState } from "react"
import Link from "next/link"
import { Music, ArrowLeft } from "lucide-react"
import { InputPanel } from "@/components/input-panel"
import { OutputPanel } from "@/components/output-panel"
import type { GenerationInput, GenerationResult, GenerateGroqResponse } from "@/lib/types"

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | GenerateGroqResponse | null>(null)
  const [currentInput, setCurrentInput] = useState<GenerationInput | null>(null)

  const handleGenerate = async (input: GenerationInput) => {
    console.log("[Create] Generate clicked, topic:", input.topic)
    setIsLoading(true)
    setResult(null)
    setCurrentInput(input)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input.topic }),
      })

      console.log("[Create] Response status:", response.status, response.statusText)

      if (!response.ok) {
        const text = await response.text()
        console.error("[Create] Non-OK response:", text)
        throw new Error("Generation failed")
      }

      const data = await response.json()
      console.log("[Create] Response data keys:", Object.keys(data), "result length:", data.result?.length ?? 0)
      setResult(data)
    } catch (error) {
      console.error("[Create] Generation error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Music className="size-5 text-primary" />
              <span
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                BeatAI
              </span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            Beat Creator
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[380px_1fr]">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="min-h-[600px]">
            <OutputPanel
              result={result}
              input={currentInput}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
