'use client'

import { useState } from 'react'
import { MusicSettingsForm, type MusicSettings } from '@/components/music-settings-form'
import { EducationalBreakdown } from '@/components/educational-breakdown'
import { AudioPlayer } from '@/components/audio-player'
import type { EducationalBreakdown as EducationalBreakdownType } from '@/app/api/generate/route'
import { Headphones, BookOpen, Sparkles } from 'lucide-react'

interface GenerationResult {
  educational: EducationalBreakdownType
  settings: MusicSettings
}

export default function SonicScholarPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (settings: MusicSettings) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      console.log('[v0] API Response:', JSON.stringify(data, null, 2))
      
      if (!response.ok) {
        if (data.error === 'AI_GATEWAY_SETUP_REQUIRED') {
          setError('AI_GATEWAY_SETUP')
        } else {
          setError(data.message || 'Failed to generate. Please try again.')
        }
        return
      }

      // Validate the response has the expected structure
      if (!data.educational) {
        console.log('[v0] Missing educational data in response')
        setError('Received invalid response from AI. Please try again.')
        return
      }

      setResult(data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Headphones className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sonic Scholar</h1>
              <p className="text-xs text-muted-foreground">AI Music Education</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Learn as you create</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Create Music.<br />Understand Music.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Generate a 30-second track and get a beginner-friendly breakdown of the music theory behind it. No experience needed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="h-6 w-1 bg-accent rounded-full" />
                Configure Your Track
              </h3>
              <MusicSettingsForm 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                {error === 'AI_GATEWAY_SETUP' ? (
                  <div className="space-y-3">
                    <p className="text-destructive font-medium">AI Gateway Setup Required</p>
                    <p className="text-sm text-muted-foreground">
                      To use AI features, you need to add a credit card to your Vercel account to unlock free AI Gateway credits.
                    </p>
                    <a 
                      href="https://vercel.com/docs/ai-gateway" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      Learn more about AI Gateway setup
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <p className="text-destructive">{error}</p>
                )}
              </div>
            )}

            {result && result.educational ? (
              <>
                <AudioPlayer 
                  title="Your Generated Track"
                  settings={result.settings}
                />
                <EducationalBreakdown data={result.educational} />
              </>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Headphones className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ready to Create
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Configure your track settings and click generate to create your music and get a personalized lesson.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Sonic Scholar - Making music education accessible to everyone</p>
        </div>
      </footer>
    </div>
  )
}
