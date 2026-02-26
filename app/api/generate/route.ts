import { generateText, Output } from "ai"
import { z } from "zod"

const generationResultSchema = z.object({
  songScript: z.object({
    intro: z.string().describe("Short intro lyrics, 2-4 lines"),
    verse1: z.string().describe("First verse lyrics, 4-8 lines"),
    chorus: z.string().describe("Catchy chorus lyrics, 4-6 lines"),
    verse2: z.string().describe("Second verse lyrics, 4-8 lines"),
    bridge: z.string().describe("Bridge section, 2-4 lines that contrast the verses"),
    outro: z.string().describe("Short outro lyrics, 2-4 lines"),
  }),
  beatStructure: z.object({
    chordProgression: z.array(z.string()).describe("Array of chord names, e.g. ['Am', 'F', 'C', 'G']"),
    bpm: z.number().describe("Beats per minute as a number"),
    instruments: z.array(z.string()).describe("List of instruments used"),
    sections: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        bars: z.number(),
      })
    ).describe("Breakdown of song sections with bar counts"),
  }),
  learning: z.object({
    chords: z.string().describe("Simple explanation of why these chords were chosen, no jargon"),
    tempo: z.string().describe("Simple explanation of why this tempo fits the mood"),
    drums: z.string().describe("Simple explanation of what the drum pattern is doing"),
    structure: z.string().describe("Simple explanation of how the intro builds into the chorus"),
  }),
})

export async function POST(req: Request) {
  const { topic, mood, tempo, includeMelody, includeBassline, includeDrumPattern } = await req.json()

  const instrumentList = [
    ...(includeDrumPattern ? ["drums"] : []),
    ...(includeBassline ? ["bass"] : []),
    ...(includeMelody ? ["melody/lead"] : []),
    "chords/pads",
  ]

  const tempoRange =
    tempo === "slow" ? "70-90" : tempo === "medium" ? "100-120" : "130-150"

  const prompt = `You are a beginner-friendly music teacher and songwriter AI. Create a complete song package for a beginner music creator.

Song topic: "${topic}"
Mood: ${mood}
Tempo preference: ${tempo} (${tempoRange} BPM range — pick a specific BPM within this range)
Instruments to include: ${instrumentList.join(", ")}

Requirements:
1. SONG SCRIPT: Write original, creative lyrics structured with Intro, Verse 1, Chorus, Verse 2, Bridge, and Outro. Make them feel authentic and match the mood.
2. BEAT STRUCTURE: Choose a fitting chord progression (4-6 chords), set BPM within the tempo range, list all instruments, and break down sections with bar counts.
3. LEARNING MODE: Explain each musical decision in simple, encouraging language. Avoid advanced music theory terms. Help the beginner understand WHY each choice was made.

Keep everything beginner-friendly and encouraging. The goal is to teach while creating.`

  const { output } = await generateText({
    model: "openai/gpt-4o-mini",
    output: Output.object({ schema: generationResultSchema }),
    prompt,
    maxOutputTokens: 3000,
    temperature: 0.8,
  })

  if (!output) {
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 }
    )
  }

  return Response.json(output)
}
