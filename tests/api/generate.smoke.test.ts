import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/generate/route'

const validBody = {
  prompt: 'A calm sunset over water',
  mood: 'chill',
  instruments: ['synth', 'drums'],
  bpm: 120,
  melody: 'simple',
  bassline: 'steady',
  drumPattern: 'four-on-the-floor',
  excitement: 50,
  vibe: 'default',
}

describe('POST /api/generate', () => {
  it('returns JSON with an educational payload (AI or fallback)', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const res = await POST(req)

    expect(res.headers.get('content-type') || '').toContain('application/json')

    const json = (await res.json()) as {
      educational?: {
        summary?: string
        rhythm_lesson?: string
        harmonic_lesson?: string
        instrument_spotlight?: string
        fun_fact?: string
      }
      settings?: Record<string, unknown>
      warning?: string
      error?: string
    }

    if (res.status === 403) {
      expect(json.error).toBe('AI_GATEWAY_SETUP_REQUIRED')
      return
    }

    expect(res.status).toBe(200)
    expect(json.educational).toBeDefined()
    expect(json.educational?.summary).toBeDefined()
    expect(json.educational?.rhythm_lesson).toBeDefined()
    expect(json.settings).toMatchObject({
      mood: 'chill',
      bpm: 120,
    })
  })
})
