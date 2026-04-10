import { generateText, Output } from 'ai'
import { z } from 'zod'
import { applyPromptTemplate, loadPromptFile, promptBodyAfterSeparator } from '@/lib/load-prompt'
import { getGenerateTextModelId } from '@/lib/model-config'
import { insertGenerationServer, type GenerationSettings } from '@/lib/log-generation'

const EducationalBreakdownSchema = z.object({
  summary: z.string().describe('A 1-sentence recap of the vibe'),
  rhythm_lesson: z.string().describe('Explain how the BPM and Drum Pattern create the energy'),
  harmonic_lesson: z.string().describe('Explain the relationship between the Bassline and Melody in simple terms'),
  instrument_spotlight: z.string().describe('Describe how the instruments achieve the requested Mood'),
  fun_fact: z.string().describe('One quick tip for a beginner producer related to this style'),
})

export type EducationalBreakdown = z.infer<typeof EducationalBreakdownSchema>

let cachedSystemPrompt: string | null = null
let cachedUserTemplate: string | null = null

function getSystemPrompt(): string {
  if (!cachedSystemPrompt) {
    cachedSystemPrompt = loadPromptFile('prompts/sonic-scholar-system.md').trim()
  }
  return cachedSystemPrompt
}

function getUserPromptTemplate(): string {
  if (!cachedUserTemplate) {
    cachedUserTemplate = promptBodyAfterSeparator(
      loadPromptFile('prompts/educational-breakdown-user.template.md')
    )
  }
  return cachedUserTemplate
}

export async function POST(req: Request) {
  const body = await req.json()
  const { prompt, mood, instruments, bpm, melody, bassline, drumPattern, excitement, vibe } = body
  const safeInstruments = Array.isArray(instruments) ? instruments : []
  const safeExcitement =
    typeof excitement === 'number' && Number.isFinite(excitement)
      ? Math.min(100, Math.max(0, Math.round(excitement)))
      : 50
  const safeVibe = typeof vibe === 'string' && vibe.trim() ? vibe.trim().toLowerCase() : 'default'

  const systemPrompt = getSystemPrompt()
  const userPrompt = applyPromptTemplate(getUserPromptTemplate(), {
    prompt: typeof prompt === 'string' ? prompt : '',
    mood: String(mood ?? ''),
    instruments: safeInstruments.join(', '),
    bpm: String(bpm ?? 120),
    safeExcitement,
    safeVibe,
    melody: String(melody ?? ''),
    bassline: String(bassline ?? ''),
    drumPattern: String(drumPattern ?? ''),
  })

  try {
    const { output } = await generateText({
      model: getGenerateTextModelId(),
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({
        schema: EducationalBreakdownSchema,
      }),
    })

    console.log('[v0] AI output:', JSON.stringify(output, null, 2))

    const settingsPayload: GenerationSettings = {
      prompt: typeof prompt === 'string' ? prompt : '',
      mood: String(mood ?? ''),
      instruments: safeInstruments,
      bpm: typeof bpm === 'number' && Number.isFinite(bpm) ? bpm : 120,
      melody: String(melody ?? ''),
      bassline: String(bassline ?? ''),
      drumPattern: String(drumPattern ?? ''),
      excitement: safeExcitement,
      vibe: safeVibe,
    }

    const responseData = {
      educational: output,
      settings: settingsPayload,
    }

    console.log('[v0] Sending response:', JSON.stringify(responseData, null, 2))

    void insertGenerationServer(settingsPayload, output)

    return Response.json(responseData)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate route] AI generation failed:', errorMessage)

    if (errorMessage.includes('credit card') || errorMessage.includes('customer_verification_required')) {
      return Response.json(
        {
          error: 'AI_GATEWAY_SETUP_REQUIRED',
          message: 'To use AI features, please add a credit card to your Vercel account to unlock free credits.',
          link: 'https://vercel.com/docs/ai-gateway',
        },
        { status: 403 }
      )
    }

    const fallbackEducational: EducationalBreakdown = {
      summary: `This sounds like a ${mood} track built around ${bpm} BPM with ${safeInstruments.join(', ') || 'a simple synth setup'}.`,
      rhythm_lesson: `At ${bpm} BPM, the track's pulse feels ${bpm < 90 ? 'relaxed' : bpm < 130 ? 'steady' : 'high-energy'}. The "${drumPattern}" pattern shapes how your head nods to that pulse. At excitement ${safeExcitement}, the groove feels ${safeExcitement < 35 ? 'spacious and soft' : safeExcitement < 70 ? 'balanced' : 'dense and upfront'}.`,
      harmonic_lesson: `Think of the ${bassline} bassline as the floor and the ${melody} melody as the storyteller on top. When they move together, the track feels clear and musical.`,
      instrument_spotlight: `Your instrument choices (${safeInstruments.join(', ') || 'synth'}) support a ${mood} mood and a "${safeVibe}" sense of space by balancing rhythm, low-end support, and melodic color.`,
      fun_fact: 'Producer tip: if your track feels crowded, mute one element at a time and keep only the parts that you truly miss.',
    }

    const fallbackSettings: GenerationSettings = {
      prompt: typeof prompt === 'string' ? prompt : '',
      mood: String(mood ?? ''),
      instruments: safeInstruments,
      bpm: typeof bpm === 'number' && Number.isFinite(bpm) ? bpm : 120,
      melody: String(melody ?? ''),
      bassline: String(bassline ?? ''),
      drumPattern: String(drumPattern ?? ''),
      excitement: safeExcitement,
      vibe: safeVibe,
    }

    void insertGenerationServer(fallbackSettings, fallbackEducational)

    return Response.json({
      educational: fallbackEducational,
      settings: fallbackSettings,
      warning: 'AI provider unavailable. Showing local fallback educational breakdown.',
    })
  }
}
