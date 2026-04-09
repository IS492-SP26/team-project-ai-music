import fs from 'fs'
import path from 'path'

const DEFAULT_MODEL = 'openai/gpt-4o-mini'

let cachedModelId: string | null = null

/** Model id for `generateText` (Vercel AI Gateway string), from `config/model.json`. */
export function getGenerateTextModelId(): string {
  if (cachedModelId) return cachedModelId
  try {
    const filePath = path.join(process.cwd(), 'config', 'model.json')
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
      generateTextModel?: string
    }
    cachedModelId =
      typeof parsed.generateTextModel === 'string' && parsed.generateTextModel.trim()
        ? parsed.generateTextModel.trim()
        : DEFAULT_MODEL
  } catch {
    cachedModelId = DEFAULT_MODEL
  }
  return cachedModelId
}
