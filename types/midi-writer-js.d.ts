declare module "midi-writer-js" {
  export type Pitch = string

  export class Track {
    setTempo(bpm: number): void
    addTrackName(name: string): void
    addEvent(event: NoteEvent | ProgramChangeEvent): void
  }

  export class NoteEvent {
    constructor(options: {
      pitch: Pitch[]
      duration: string
      velocity?: number
      channel?: number
    })
  }

  export class ProgramChangeEvent {
    constructor(options: { instrument: number })
  }

  export class Writer {
    constructor(tracks: Track[])
    buildFile(): Uint8Array
  }
}
