export type Mood = "happy" | "sad" | "motivational" | "dark" | "chill"
export type Tempo = "slow" | "medium" | "fast"

export interface GenerationInput {
  topic: string
  mood: Mood
  tempo: Tempo
  includeMelody: boolean
  includeBassline: boolean
  includeDrumPattern: boolean
}

export interface SongScript {
  intro: string
  verse1: string
  chorus: string
  verse2: string
  bridge: string
  outro: string
}

export interface BeatStructure {
  chordProgression: string[]
  bpm: number
  instruments: string[]
  sections: {
    name: string
    description: string
    bars: number
  }[]
}

export interface LearningExplanation {
  chords: string
  tempo: string
  drums: string
  structure: string
}

export interface GenerationResult {
  songScript: SongScript
  beatStructure: BeatStructure
  learning: LearningExplanation
}

/** Response from /api/generate when using Groq (plain text result) */
export interface GenerateGroqResponse {
  result: string
}
