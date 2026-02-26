import MidiWriter from "midi-writer-js"
import type { BeatStructure, GenerationInput } from "@/lib/types"

// Map chord names to MIDI note arrays
const chordToNotes: Record<string, string[]> = {
  C: ["C4", "E4", "G4"],
  Cm: ["C4", "Eb4", "G4"],
  D: ["D4", "F#4", "A4"],
  Dm: ["D4", "F4", "A4"],
  E: ["E4", "G#4", "B4"],
  Em: ["E4", "G4", "B4"],
  F: ["F4", "A4", "C5"],
  Fm: ["F4", "Ab4", "C5"],
  G: ["G4", "B4", "D5"],
  Gm: ["G4", "Bb4", "D5"],
  A: ["A4", "C#5", "E5"],
  Am: ["A4", "C5", "E5"],
  B: ["B4", "D#5", "F#5"],
  Bm: ["B4", "D5", "F#5"],
  Bb: ["Bb4", "D5", "F5"],
  Bbm: ["Bb4", "Db5", "F5"],
  Eb: ["Eb4", "G4", "Bb4"],
  Ab: ["Ab4", "C5", "Eb5"],
}

function getChordNotes(chordName: string): string[] {
  // Try exact match first, then fallback
  const cleanName = chordName.replace(/[0-9]/g, "").trim()
  return chordToNotes[cleanName] || chordToNotes["C"]
}

export async function POST(req: Request) {
  const { beat, input }: { beat: BeatStructure; input: GenerationInput } =
    await req.json()

  const tracks: MidiWriter.Track[] = []

  // Chord track
  const chordTrack = new MidiWriter.Track()
  chordTrack.setTempo(beat.bpm)
  chordTrack.addTrackName("Chords")

  // Play chord progression 4 times (typical song length)
  for (let repeat = 0; repeat < 4; repeat++) {
    for (const chord of beat.chordProgression) {
      const notes = getChordNotes(chord)
      chordTrack.addEvent(
        new MidiWriter.NoteEvent({
          pitch: notes as MidiWriter.Pitch[],
          duration: "1",
          velocity: 70,
        })
      )
    }
  }
  tracks.push(chordTrack)

  // Drum track
  if (input.includeDrumPattern) {
    const drumTrack = new MidiWriter.Track()
    drumTrack.setTempo(beat.bpm)
    drumTrack.addTrackName("Drums")
    // Channel 10 for drums (0-indexed = 9)
    drumTrack.addEvent(
      new MidiWriter.ProgramChangeEvent({ instrument: 0 })
    )

    // Simple drum pattern: kick on 1 & 3, snare on 2 & 4, hi-hat on every beat
    const totalBars = beat.chordProgression.length * 4
    for (let bar = 0; bar < totalBars; bar++) {
      for (let beat_num = 0; beat_num < 4; beat_num++) {
        // Hi-hat on every beat
        drumTrack.addEvent(
          new MidiWriter.NoteEvent({
            pitch: ["F#2"] as MidiWriter.Pitch[],
            duration: "4",
            velocity: 50,
            channel: 10,
          })
        )
      }
    }
    tracks.push(drumTrack)
  }

  // Bassline track
  if (input.includeBassline) {
    const bassTrack = new MidiWriter.Track()
    bassTrack.setTempo(beat.bpm)
    bassTrack.addTrackName("Bass")

    for (let repeat = 0; repeat < 4; repeat++) {
      for (const chord of beat.chordProgression) {
        const notes = getChordNotes(chord)
        // Bass plays the root note, one octave down
        const rootNote = notes[0].replace("4", "2").replace("5", "3")
        bassTrack.addEvent(
          new MidiWriter.NoteEvent({
            pitch: [rootNote] as MidiWriter.Pitch[],
            duration: "2",
            velocity: 80,
          })
        )
        bassTrack.addEvent(
          new MidiWriter.NoteEvent({
            pitch: [rootNote] as MidiWriter.Pitch[],
            duration: "2",
            velocity: 60,
          })
        )
      }
    }
    tracks.push(bassTrack)
  }

  // Melody track
  if (input.includeMelody) {
    const melodyTrack = new MidiWriter.Track()
    melodyTrack.setTempo(beat.bpm)
    melodyTrack.addTrackName("Melody")

    for (let repeat = 0; repeat < 4; repeat++) {
      for (const chord of beat.chordProgression) {
        const notes = getChordNotes(chord)
        // Simple melody: arpeggiate the chord notes up then back
        const melodyNotes = [
          notes[0].replace("4", "5"),
          notes[1].replace("4", "5"),
          notes[2].replace("4", "5").replace("5", "5"),
          notes[1].replace("4", "5"),
        ]
        for (const note of melodyNotes) {
          melodyTrack.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [note] as MidiWriter.Pitch[],
              duration: "4",
              velocity: 65,
            })
          )
        }
      }
    }
    tracks.push(melodyTrack)
  }

  const writer = new MidiWriter.Writer(tracks)
  const midiData = writer.buildFile()

  return new Response(Buffer.from(midiData), {
    headers: {
      "Content-Type": "audio/midi",
      "Content-Disposition": 'attachment; filename="beatAI_project.mid"',
    },
  })
}
