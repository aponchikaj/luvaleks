import { useSettingsStore } from '@/stores/settingsStore'

// Retro UI sounds synthesized with Web Audio — no audio files to load.
let ctx = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq, to, dur = 0.06, type = 'square', gain = 0.03, delay = 0 }) {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

const sounds = {
  click: () => tone({ freq: 1800, dur: 0.025, gain: 0.015 }),
  open: () => tone({ freq: 440, to: 880, dur: 0.12, type: 'triangle', gain: 0.05 }),
  close: () => tone({ freq: 880, to: 330, dur: 0.12, type: 'triangle', gain: 0.05 }),
  minimize: () => tone({ freq: 660, to: 220, dur: 0.18, type: 'sine', gain: 0.05 }),
  heart: () => {
    tone({ freq: 784, dur: 0.08, type: 'sine', gain: 0.06 })
    tone({ freq: 1175, dur: 0.12, type: 'sine', gain: 0.06, delay: 0.07 })
  },
  error: () => tone({ freq: 160, dur: 0.2, type: 'sawtooth', gain: 0.04 }),
  // The startup chime: a warm major chord, rolled.
  boot: () =>
    [261.63, 329.63, 392, 523.25].forEach((freq, i) =>
      tone({ freq, dur: 1.6, type: 'sine', gain: 0.07, delay: i * 0.04 }),
    ),
}

export function play(name) {
  if (!useSettingsStore.getState().sound) return
  try {
    sounds[name]?.()
  } catch {
    // Audio is decoration — never let it break the UI.
  }
}
