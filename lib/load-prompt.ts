import fs from 'fs'
import path from 'path'

/**
 * Load a UTF-8 prompt file from the repository root (e.g. `app/prompts/foo.md`).
 * Server-only — do not import from Client Components.
 */
export function loadPromptFile(relativePathFromRepoRoot: string): string {
  const full = path.join(process.cwd(), relativePathFromRepoRoot)
  return fs.readFileSync(full, 'utf-8')
}

/** Replace `{{key}}` placeholders in a template string. */
export function applyPromptTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  let out = template
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(String(value))
  }
  return out
}

/** Use content after first `\n---\n` so human docs can live above the fold. */
export function promptBodyAfterSeparator(fullFile: string): string {
  const sep = '\n---\n'
  const idx = fullFile.indexOf(sep)
  return (idx >= 0 ? fullFile.slice(idx + sep.length) : fullFile).trim()
}
