/** Shared Web Audio scheduling helpers for previews and full track. */

export function scheduleTone(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
  end: number,
  gainAmount: number,
  waveType: OscillatorType = 'sine',
  bucket: AudioScheduledSourceNode[]
) {
  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.type = waveType
  osc.frequency.setValueAtTime(frequency, start)
  osc.connect(oscGain)
  oscGain.connect(destination)
  oscGain.gain.setValueAtTime(0.0001, start)
  oscGain.gain.exponentialRampToValueAtTime(Math.max(gainAmount, 0.0002), start + 0.01)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.start(start)
  osc.stop(end + 0.02)
  bucket.push(osc)
}

export function scheduleKick(
  ctx: AudioContext,
  destination: AudioNode,
  start: number,
  punch = 0.35,
  bucket: AudioScheduledSourceNode[]
) {
  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(120, start)
  osc.frequency.exponentialRampToValueAtTime(45, start + 0.1)
  osc.connect(oscGain)
  oscGain.connect(destination)
  oscGain.gain.setValueAtTime(0.0001, start)
  oscGain.gain.exponentialRampToValueAtTime(punch, start + 0.005)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12)
  osc.start(start)
  osc.stop(start + 0.13)
  bucket.push(osc)
}

export function scheduleHat(
  ctx: AudioContext,
  destination: AudioNode,
  start: number,
  brightness: number,
  bucket: AudioScheduledSourceNode[]
) {
  const bufferSize = ctx.sampleRate * 0.05
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = ctx.createBufferSource()
  const bandPass = ctx.createBiquadFilter()
  const noiseGain = ctx.createGain()
  bandPass.type = 'highpass'
  bandPass.frequency.setValueAtTime(4000 + brightness * 80, start)
  noise.buffer = buffer
  noise.connect(bandPass)
  bandPass.connect(noiseGain)
  noiseGain.connect(destination)
  noiseGain.gain.setValueAtTime(0.0001, start)
  noiseGain.gain.exponentialRampToValueAtTime(0.06 + brightness * 0.0004, start + 0.001)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04)
  noise.start(start)
  noise.stop(start + 0.05)
  bucket.push(noise)
}

export const moodBaseHz: Record<string, number> = {
  chill: 220,
  energetic: 330,
  dark: 196,
  uplifting: 392,
  ambient: 261.63,
}
