// Sonido sintetizado con Web Audio: no hay archivos de audio que descargar.
// En la Luna no hay aire, así que el sonido no viaja por fuera: todo lo que se oye
// es "dentro del casco" de Pibble (radio, pasos que vibran por el traje, motor).

let ctx = null
let master = null
let muted = false
let thrustGain = null

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume()
    return
  }
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = muted ? 0 : 0.7
  master.connect(ctx.destination)
}

export function setMuted(m) {
  muted = m
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.7, ctx.currentTime, 0.05)
}
export const isMuted = () => muted

function tone(freq, dur, { type = 'sine', vol = 0.2, delay = 0, slide = 0 } = {}) {
  if (!ctx) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function noiseBuffer() {
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

export const sfx = {
  discover() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.18, delay: i * 0.09 }))
  },
  clue() {
    tone(880, 0.25, { type: 'sine', vol: 0.15 })
    tone(1175, 0.4, { type: 'sine', vol: 0.15, delay: 0.12 })
  },
  // Eco del retrorreflector: más fuerte cuanto mejor apuntas.
  ping(strength) {
    const v = 0.03 + 0.25 * strength
    tone(1480, 0.18, { vol: v })
    tone(1480, 0.3, { vol: v * 0.35, delay: 0.22 })
  },
  step() {
    tone(70, 0.12, { vol: 0.08, slide: -30 })
  },
  land(impact) {
    tone(60, 0.35, { vol: Math.min(0.4, 0.1 + impact * 0.05), slide: -25 })
  },
  bounce() {
    tone(90, 0.3, { type: 'square', vol: 0.12, slide: -50 })
    tone(420, 0.15, { type: 'triangle', vol: 0.1, delay: 0.03 })
  },
  click() {
    tone(660, 0.06, { type: 'square', vol: 0.05 })
  },
  // Motor del saltador: ruido filtrado que se enciende y apaga.
  thrust(level) {
    if (!ctx) return
    if (!thrustGain) {
      const src = ctx.createBufferSource()
      src.buffer = noiseBuffer()
      src.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 500
      thrustGain = ctx.createGain()
      thrustGain.gain.value = 0
      src.connect(filter).connect(thrustGain).connect(master)
      src.start()
    }
    thrustGain.gain.setTargetAtTime(level * 0.35, ctx.currentTime, 0.05)
  },
}
