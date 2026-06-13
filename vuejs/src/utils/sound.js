let audioCtx = null

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function playTone(ctx, freq, start, dur, type = 'sine', vol = 0.20) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.connect(g)
  g.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  g.gain.setValueAtTime(vol, start)
  g.gain.exponentialRampToValueAtTime(0.001, start + dur)
  osc.start(start)
  osc.stop(start + dur)
}

export function playAddSound() {
  const ctx = getCtx()
  const t = ctx.currentTime
  playTone(ctx, 1047, t, 0.08, 'sine', 0.32)
  playTone(ctx, 1568, t + 0.05, 0.12, 'sine', 0.24)
  playTone(ctx, 2093, t + 0.05, 0.12, 'triangle', 0.10)
}

export function playRemoveSound() {
  const ctx = getCtx()
  const t = ctx.currentTime
  playTone(ctx, 784, t, 0.08, 'sine', 0.32)
  playTone(ctx, 523, t + 0.05, 0.12, 'sine', 0.24)
}
