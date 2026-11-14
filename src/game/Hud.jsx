import { useEffect, useState } from 'react'
import { game } from './store'
import { setTouch, input } from './input'
import { unitsToRealKm, EARTH_JUMP_M } from './constants'

const fmt = (n, d = 1) => n.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d })

function TouchPad() {
  const hold = (axis, value) => ({
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      setTouch(axis, value)
    },
    onPointerUp: () => setTouch(axis, 0),
    onPointerCancel: () => setTouch(axis, 0),
  })
  return (
    <div className="touchpad" aria-hidden="true">
      <div className="dpad">
        <button className="up" {...hold('forward', 1)}>▲</button>
        <button className="left" {...hold('turn', 1)}>◀</button>
        <button className="right" {...hold('turn', -1)}>▶</button>
        <button className="down" {...hold('forward', -1)}>▼</button>
      </div>
      <button className="jump" onPointerDown={() => (input.jumpQueued = true)}>Saltar</button>
    </div>
  )
}

export default function Hud({ artifacts, nearId, onInteract, onMap }) {
  const [stats, setStats] = useState({ km: 0, jump: 0, airborne: false })
  const [hint, setHint] = useState(true)
  const [help, setHelp] = useState(true)
  const near = artifacts.find((a) => a.id === nearId)

  useEffect(() => {
    const id = setInterval(() => {
      setStats({ km: unitsToRealKm(game.distance), jump: game.lastJump, airborne: !game.grounded })
    }, 150)
    const t = setTimeout(() => setHint(false), 9000)
    return () => {
      clearInterval(id)
      clearTimeout(t)
    }
  }, [])

  return (
    <div className="hud">
      <div className="hud-top">
        <span className="hud-brand">ASTROPIBBLES</span>
        <div className="hud-actions">
          <button onClick={() => setHelp((h) => !h)} aria-expanded={help}>Controles</button>
          <button onClick={onMap}>🗺 Mapa (M)</button>
        </div>
      </div>

      {help && (
        <div className="hud-help" role="note">
          <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas: caminar y girar</p>
          <p><kbd>Shift</kbd>: correr · <kbd>Espacio</kbd>: saltar · <kbd>E</kbd>: examinar</p>
          <button className="link" onClick={() => setHelp(false)}>Entendido</button>
        </div>
      )}

      {hint && <p className="hud-hint">Algo brilla en el horizonte…</p>}

      <div className="hud-stats">
        <p>
          <span className="label">Recorrido</span>
          <strong>{fmt(stats.km, 0)} km</strong>
          <span className="sub">de superficie lunar real</span>
        </p>
        {stats.jump > 0 && (
          <p>
            <span className="label">Último salto</span>
            <strong>{fmt(stats.jump)} m</strong>
            <span className="sub">en la Tierra: {fmt(EARTH_JUMP_M)} m · gravedad lunar 1,62 m/s²</span>
          </p>
        )}
      </div>

      {near && (
        <button className="hud-prompt" style={{ '--ghost': near.color }} onClick={() => onInteract(near.id)}>
          <kbd>E</kbd> Examinar <strong>{near.nickname}</strong>
        </button>
      )}

      <TouchPad />
    </div>
  )
}
