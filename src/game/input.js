// Entrada unificada: teclado y botones táctiles escriben en el mismo objeto.
export const input = {
  forward: 0, // 1 adelante, -1 atrás
  turn: 0, // 1 izquierda, -1 derecha
  run: false,
  jumpQueued: false,
  interactQueued: false,
  touch: { forward: 0, turn: 0 },
}

const held = new Set()

function recompute() {
  const k = (...codes) => codes.some((c) => held.has(c))
  input.forward = (k('KeyW', 'ArrowUp') ? 1 : 0) - (k('KeyS', 'ArrowDown') ? 1 : 0) || input.touch.forward
  input.turn = (k('KeyA', 'ArrowLeft') ? 1 : 0) - (k('KeyD', 'ArrowRight') ? 1 : 0) || input.touch.turn
  input.run = k('ShiftLeft', 'ShiftRight')
}

export function setTouch(axis, value) {
  input.touch[axis] = value
  recompute()
}

export function bindKeyboard() {
  const GAME_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyE']
  const down = (e) => {
    if (!GAME_KEYS.includes(e.code)) return
    e.preventDefault()
    if (!e.repeat && e.code === 'Space') input.jumpQueued = true
    if (!e.repeat && e.code === 'KeyE') input.interactQueued = true
    held.add(e.code)
    recompute()
  }
  const up = (e) => {
    held.delete(e.code)
    recompute()
  }
  const blur = () => {
    held.clear()
    recompute()
  }
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)
  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
    blur()
  }
}
