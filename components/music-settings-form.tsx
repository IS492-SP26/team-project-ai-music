'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { EducationalHint } from '@/components/educational-hint'
import { OptionPreviewButton } from '@/components/option-preview-button'
import { VIBE_OPTIONS } from '@/lib/vibe-presets'
import {
  Music,
  Zap,
  Moon,
  Sun,
  Cloud,
  Piano,
  Guitar,
  Drum,
  Mic2,
  Waves,
} from 'lucide-react'

export interface MusicSettings {
  prompt: string
  mood: string
  instruments: string[]
  bpm: number
  melody: string
  bassline: string
  drumPattern: string
  excitement: number
  vibe: string
}

interface MusicSettingsFormProps {
  onGenerate: (settings: MusicSettings) => void
  isLoading: boolean
}

const moods = [
  { id: 'chill', label: 'Chill', icon: Cloud },
  { id: 'energetic', label: 'Energetic', icon: Zap },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'uplifting', label: 'Uplifting', icon: Sun },
  { id: 'ambient', label: 'Ambient', icon: Waves },
]

const instruments = [
  { id: 'synth', label: 'Synth', icon: Waves },
  { id: 'piano', label: 'Piano', icon: Piano },
  { id: 'guitar', label: 'Guitar', icon: Guitar },
  { id: 'violin', label: 'Violin', icon: Music },
  { id: 'drums', label: 'Drums', icon: Drum },
  { id: 'bass', label: 'Bass', icon: Mic2 },
]

const melodyStyles = [
  { id: 'simple', label: 'Simple & Catchy' },
  { id: 'complex', label: 'Complex & Evolving' },
  { id: 'minimal', label: 'Minimal & Sparse' },
  { id: 'melodic', label: 'Rich & Melodic' },
]

const basslineStyles = [
  { id: 'steady', label: 'Steady & Grounding' },
  { id: 'walking', label: 'Walking Bass' },
  { id: 'punchy', label: 'Punchy & Rhythmic' },
  { id: 'sub', label: 'Deep Sub Bass' },
]

const drumPatterns = [
  { id: 'four-on-floor', label: 'Four on the Floor' },
  { id: 'breakbeat', label: 'Breakbeat' },
  { id: 'trap', label: 'Trap Hi-Hats' },
  { id: 'minimal', label: 'Minimal Percussion' },
  { id: 'acoustic', label: 'Acoustic Groove' },
]

export function MusicSettingsForm({ onGenerate, isLoading }: MusicSettingsFormProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedMood, setSelectedMood] = useState('chill')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(['synth', 'drums'])
  const [bpm, setBpm] = useState(120)
  const [excitement, setExcitement] = useState(50)
  const [vibe, setVibe] = useState('default')
  const [melody, setMelody] = useState('simple')
  const [bassline, setBassline] = useState('steady')
  const [drumPattern, setDrumPattern] = useState('four-on-floor')

  const toggleInstrument = (id: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!prompt.trim()) return
    onGenerate({
      prompt,
      mood: selectedMood,
      instruments: selectedInstruments,
      bpm,
      melody,
      bassline,
      drumPattern,
      excitement,
      vibe,
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="prompt" className="text-base font-medium text-foreground">
            Describe your track
          </Label>
          <OptionPreviewButton spec={{ kind: 'prompt' }} label="your description" />
        </div>
        <EducationalHint>
          This is the story you want the music to tell—like a movie scene in words. The more specific you are about
          feelings, places, or memories, the easier it is to shape a matching vibe. You do not need fancy wording; plain
          language works great.
        </EducationalHint>
        <Textarea
          id="prompt"
          placeholder="A dreamy sunset on the beach with gentle waves..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-24 resize-none border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">Mood</Label>
        <EducationalHint>
          Mood is the emotional color of the piece—think cozy, bold, mysterious, or floating. It nudges the overall warmth,
          tension, and how “big” the mix feels. Changing mood is one of the fastest ways to make the same idea sound
          totally different.
        </EducationalHint>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => {
            const Icon = mood.icon
            const isSelected = selectedMood === mood.id
            return (
              <div
                key={mood.id}
                className={`flex items-stretch overflow-hidden rounded-full border ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all sm:px-4 ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {mood.label}
                </button>
                <div className="flex border-l border-border/60 bg-card/40">
                  <OptionPreviewButton spec={{ kind: 'mood', id: mood.id }} label={mood.label} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">Sound space (vibe)</Label>
        <EducationalHint>
          Vibe is the imaginary room your track lives in—like mist over the ocean, a gritty warehouse, or a glowing
          cathedral. It steers how roomy, washy, or tight everything feels together, on top of mood and speed. Pick one
          that matches the scene in your head, then tweak excitement to push the energy.
        </EducationalHint>
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map((v) => {
            const isSelected = vibe === v.id
            return (
              <div
                key={v.id}
                className={`flex items-stretch overflow-hidden rounded-full border ${
                  isSelected ? 'border-accent ring-1 ring-accent' : 'border-border/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setVibe(v.id)}
                  className={`px-3 py-2 text-sm font-medium transition-all sm:px-4 ${
                    isSelected ? 'bg-accent text-accent-foreground' : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  {v.label}
                </button>
                <div className="flex border-l border-border/60 bg-card/40">
                  <OptionPreviewButton spec={{ kind: 'vibe', id: v.id }} label={v.label} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">Instruments</Label>
        <EducationalHint>
          Each instrument adds a different role: some carry the tune, some hold down the low end, and some add snap and
          groove. You can mix and match; fewer parts often sound cleaner for beginners. If something feels busy, try
          turning one part off and listen again.
        </EducationalHint>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {instruments.map((instrument) => {
            const Icon = instrument.icon
            const isSelected = selectedInstruments.includes(instrument.id)
            return (
              <div
                key={instrument.id}
                className={`flex min-h-[3rem] items-stretch overflow-hidden rounded-lg border ${
                  isSelected ? 'border-accent ring-2 ring-accent' : 'border-border/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleInstrument(instrument.id)}
                  className={`flex flex-1 items-center gap-2 px-3 py-3 text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {instrument.label}
                </button>
                <div className="flex border-l border-border/60 bg-card/40">
                  <OptionPreviewButton spec={{ kind: 'instrument', id: instrument.id }} label={instrument.label} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-base font-medium text-foreground">Speed (BPM)</Label>
          <div className="flex items-center gap-1">
            <span className="font-mono text-2xl font-bold tabular-nums text-primary">{bpm}</span>
            <OptionPreviewButton spec={{ kind: 'bpm', bpm }} label={`tempo ${bpm}`} />
          </div>
        </div>
        <EducationalHint>
          BPM is simply how fast the beat ticks—like a metronome or a heart rate for the song. Lower numbers feel relaxed
          and roomy; higher numbers feel urgent and athletic. Small changes matter: even 5–10 steps can change how a
          part “sits.”
        </EducationalHint>
        <Slider
          value={[bpm]}
          onValueChange={([value]) => setBpm(value)}
          min={60}
          max={180}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>60 (Slow)</span>
          <span>120 (Medium)</span>
          <span>180 (Fast)</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-base font-medium text-foreground">Excitement</Label>
          <div className="flex items-center gap-1">
            <span className="font-mono text-xl font-bold tabular-nums text-primary">{excitement}</span>
            <OptionPreviewButton spec={{ kind: 'excitement', value: excitement }} label="excitement" />
          </div>
        </div>
        <EducationalHint>
          Excitement is how “amped up” the preview feels: more layers, more sparkle on top, and a tighter, punchier
          groove. Think of it like turning up the crowd energy at a show—not the same as speed, more like intensity and
          fullness.
        </EducationalHint>
        <Slider
          value={[excitement]}
          onValueChange={([value]) => setExcitement(value)}
          min={0}
          max={100}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Calm</span>
          <span>Balanced</span>
          <span>Intense</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">Melody style</Label>
        <EducationalHint>
          Melody style is about how busy the top tune is—sparse dots vs. a busier sing-song line. Simpler lines are easy
          to remember; busier lines feel more dramatic and changing. If lyrics were involved, this is the part people
          hum.
        </EducationalHint>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {melodyStyles.map((style) => {
            const isSelected = melody === style.id
            return (
              <div
                key={style.id}
                className={`flex min-h-[3rem] items-stretch overflow-hidden rounded-lg border ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMelody(style.id)}
                  className={`flex flex-1 items-center px-4 py-3 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  {style.label}
                </button>
                <div className="flex border-l border-border/60 bg-card/40">
                  <OptionPreviewButton spec={{ kind: 'melody', id: style.id }} label={style.label} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">Bassline style</Label>
        <EducationalHint>
          The bassline is the big, low part that helps your body feel the groove. Some styles stay planted in one spot,
          others walk around, and some hit hard on the off-moments for extra punch. If the mix feels thin, bass is often
          the first place to strengthen.
        </EducationalHint>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {basslineStyles.map((style) => {
            const isSelected = bassline === style.id
            return (
              <div
                key={style.id}
                className={`flex min-h-[3rem] items-stretch overflow-hidden rounded-lg border ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setBassline(style.id)}
                  className={`flex flex-1 items-center px-4 py-3 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  {style.label}
                </button>
                <div className="flex border-l border-border/60 bg-card/40">
                  <OptionPreviewButton spec={{ kind: 'bassline', id: style.id }} label={style.label} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">Drum pattern</Label>
        <EducationalHint>
          Drums set the physical rhythm—where the thump lands and how much shimmer sits between thumps. Some patterns
          feel like a steady club pulse; others feel like a break in the action. Changing drums is a big lever for genre
          and energy without touching anything else.
        </EducationalHint>
        <div className="flex flex-wrap gap-2">
          {drumPatterns.map((pattern) => {
            const isSelected = drumPattern === pattern.id
            return (
              <div
                key={pattern.id}
                className={`flex items-stretch overflow-hidden rounded-full border ${
                  isSelected ? 'border-accent ring-1 ring-accent' : 'border-border/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setDrumPattern(pattern.id)}
                  className={`px-3 py-2 text-sm font-medium transition-all sm:px-4 ${
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  {pattern.label}
                </button>
                <div className="flex border-l border-border/60 bg-card/40">
                  <OptionPreviewButton spec={{ kind: 'drum', id: pattern.id }} label={pattern.label} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim() || selectedInstruments.length === 0}
        className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner className="h-5 w-5" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Generate Music & Learn
          </span>
        )}
      </Button>
    </div>
  )
}
