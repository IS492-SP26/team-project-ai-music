export type PreviewSpec =
  | { kind: 'mood'; id: string }
  | { kind: 'instrument'; id: string }
  | { kind: 'melody'; id: string }
  | { kind: 'bassline'; id: string }
  | { kind: 'drum'; id: string }
  | { kind: 'bpm'; bpm: number }
  | { kind: 'excitement'; value: number }
  | { kind: 'prompt' }
  | { kind: 'vibe'; id: string }
