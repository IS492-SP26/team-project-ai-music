import OpenAI from "openai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("[Generate API] POST /api/generate received, topic:", body?.topic ?? "(missing)")

    if (!process.env.GROQ_API_KEY) {
      console.error("[Generate API] Missing GROQ_API_KEY")
      return new Response("Missing GROQ_API_KEY", { status: 500 })
    }

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })

    // Replaced deprecated llama3-8b-8192 (model_decommissioned) with supported model
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a beginner-friendly music teacher who generates structured song scripts and simple beat plans."
        },
        {
          role: "user",
          content: `Generate a structured song script and simple beat plan about: ${body.topic}`
        }
      ],
      temperature: 0.8
    })

    const content = completion.choices[0]?.message?.content ?? ""
    console.log("[Generate API] Groq response received, length:", content.length)

    return Response.json({
      result: content
    })
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown; message?: string }
    console.error("[Generate API] Groq error:", err?.message ?? error)
    if (err?.status != null) console.error("[Generate API] Groq status:", err.status)
    if (err?.error != null) console.error("[Generate API] Groq response body:", JSON.stringify(err.error))
    return new Response("Generation failed", { status: 500 })
  }
}
