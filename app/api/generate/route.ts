import { generateText, Output } from 'ai'
import { z } from 'zod'

const EducationalBreakdownSchema = z.object({
  summary: z.string().describe('A 1-sentence recap of the vibe'),
  rhythm_lesson: z.string().describe('Explain how the BPM and Drum Pattern create the energy'),
  harmonic_lesson: z.string().describe('Explain the relationship between the Bassline and Melody in simple terms'),
  instrument_spotlight: z.string().describe('Describe how the instruments achieve the requested Mood'),
  fun_fact: z.string().describe('One quick tip for a beginner producer related to this style'),
})

export type EducationalBreakdown = z.infer<typeof EducationalBreakdownSchema>

export async function POST(req: Request) {
  const body = await req.json()
  const { prompt, mood, instruments, bpm, melody, bassline, drumPattern, excitement, vibe } = body
  const safeInstruments = Array.isArray(instruments) ? instruments : []
  const safeExcitement =
    typeof excitement === 'number' && Number.isFinite(excitement)
      ? Math.min(100, Math.max(0, Math.round(excitement)))
      : 50
  const safeVibe = typeof vibe === 'string' && vibe.trim() ? vibe.trim().toLowerCase() : 'default'

  const systemPrompt = `You are the "Sonic Scholar" AI - a friendly music education assistant. Your mission is to explain music concepts to beginners using simple language and helpful analogies.

Use analogies like:
- "The bass is the floor of the room"
- "The BPM is the heartbeat of the track"
- "The melody is like the voice telling the story"
- "The drums are the skeleton that holds everything together"

IMPORTANT: Use very simple, easy-to-understand language. Avoid academic jargon. Be encouraging and make music production feel accessible.`

  const userPrompt = `Generate a beginner-friendly educational breakdown for a music track with these settings:

**User's Creative Vision:** "${prompt}"
**Mood:** ${mood}
**Instruments:** ${safeInstruments.join(', ')}
**BPM:** ${bpm}
**Excitement / Intensity:** ${safeExcitement} (0 calm → 100 intense)
**Vibe / Sound space:** ${safeVibe}
**Melody Style:** ${melody}
**Bassline Style:** ${bassline}
**Drum Pattern:** ${drumPattern}

Create an educational breakdown that explains:
1. A quick vibe summary
2. How the ${bpm} BPM and ${drumPattern} drum pattern create the energy
3. How excitement at ${safeExcitement} changes how "busy" and punchy the track feels (without only talking about speed)
4. How the "${safeVibe}" vibe changes the sense of space and texture (washy vs tight, bright vs dark)
5. How the ${bassline} bassline and ${melody} melody work together
6. How the instruments (${safeInstruments.join(', ')}) achieve the ${mood} mood
7. A fun production tip for beginners`

  try {
    const { output } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({
        schema: EducationalBreakdownSchema,
      }),
    })

    console.log('[v0] AI output:', JSON.stringify(output, null, 2))

    const responseData = {
      educational: output,
      settings: {
        prompt,
        mood,
        instruments: safeInstruments,
        bpm,
        melody,
        bassline,
        drumPattern,
        excitement: safeExcitement,
        vibe: safeVibe,
      },
    }

    console.log('[v0] Sending response:', JSON.stringify(responseData, null, 2))

    return Response.json(responseData)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate route] AI generation failed:', errorMessage)
    
    // Check for credit card requirement error
    if (errorMessage.includes('credit card') || errorMessage.includes('customer_verification_required')) {
      return Response.json({
        error: 'AI_GATEWAY_SETUP_REQUIRED',
        message: 'To use AI features, please add a credit card to your Vercel account to unlock free credits.',
        link: 'https://vercel.com/docs/ai-gateway'
      }, { status: 403 })
    }
    
    const fallbackEducational: EducationalBreakdown = {
      summary: `This sounds like a ${mood} track built around ${bpm} BPM with ${safeInstruments.join(', ') || 'a simple synth setup'}.`,
      rhythm_lesson: `At ${bpm} BPM, the track's pulse feels ${bpm < 90 ? 'relaxed' : bpm < 130 ? 'steady' : 'high-energy'}. The "${drumPattern}" pattern shapes how your head nods to that pulse. At excitement ${safeExcitement}, the groove feels ${safeExcitement < 35 ? 'spacious and soft' : safeExcitement < 70 ? 'balanced' : 'dense and upfront'}.`,
      harmonic_lesson: `Think of the ${bassline} bassline as the floor and the ${melody} melody as the storyteller on top. When they move together, the track feels clear and musical.`,
      instrument_spotlight: `Your instrument choices (${safeInstruments.join(', ') || 'synth'}) support a ${mood} mood and a "${safeVibe}" sense of space by balancing rhythm, low-end support, and melodic color.`,
      fun_fact: 'Producer tip: if your track feels crowded, mute one element at a time and keep only the parts that you truly miss.',
    }

    return Response.json({
      educational: fallbackEducational,
      settings: {
        prompt,
        mood,
        instruments: safeInstruments,
        bpm,
        melody,
        bassline,
        drumPattern,
        excitement: safeExcitement,
        vibe: safeVibe,
      },
      warning: 'AI provider unavailable. Showing local fallback educational breakdown.',
    })
  }
}
