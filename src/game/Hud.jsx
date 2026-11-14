import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { game } from './store'
import { setTouch, input } from './input'
import { unitsToRealKm, EARTH_JUMP_M, MOON_RADIUS_KM } from './constants'
import { latLonToVec3 } from '../lib/geo'

const fmt = (n, d = 1) => n.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d })
const tangent = new THREE.Vector3()
const cross = new THREE.Vector3()

// Ángulo (rad, + = a la izquierda) y distancia real (km) desde Pibble hasta un punto.
function bearingTo(target) {
  const cos = THREE.MathUtils.clamp(game.n.dot(target), -1, 1)
  tangent.copy(target).addScaledVector(game.n, -cos).normalize()
  const angle = Math.atan2(cross.crossVectors(game.f, tangent).dot(game.n), game.f.dot(tangent))
  return { angle, km: Math.acos(cos) * MOON_RADIUS_KM }
}

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

export default function Hud({ artifacts, nearId, trackedRumor, newLog, onInteract, onMap, onLog }) {
  const [stats, setStats] = useState({ km: 0, jump: 0, bearing: null })
  const [help, setHelp] = useState(true)
  const near = artifacts.find((a) => a.id === nearId)
  const targetArt = trackedRumor && artifacts.find((a) => a.id === trackedRumor.target)

  useEffect(() => {
    const target = targetArt ? latLonToVec3(targetArt.lat, targetArt.lon, 1) : null
    const id = setInterval(() => {
      setStats({
        km: unitsToRealKm(game.distance),
        jump: game.lastJump,
        bearing: target ? bearingTo(target) : null,
      })
    }, 120)
    return () => clearInterval(id)
  }, [targetArt])

  return (
    <div className="hud">
      <div className="hud-top">
        <span className="hud-brand">ASTROPIBBLES</span>
        <div className="hud-actions">
          <button onClick={() => setHelp((h) => !h)} aria-expanded={help}>Controles</button>
          <button onClick={onLog} className={newLog ? 'has-new' : ''}>📓 Bitácora (B)</button>
          <button onClick={onMap}>🗺 Mapa (M)</button>
        </div>
      </div>

      {help && (
        <div className="hud-help" role="note">
          <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas: caminar y girar</p>
          <p><kbd>Shift</kbd>: correr · <kbd>Espacio</kbd>: saltar · <kbd>E</kbd>: examinar</p>
          <p><kbd>B</kbd>: bitácora · <kbd>M</kbd>: mapa</p>
          <button className="link" onClick={() => setHelp(false)}>Entendido</button>
        </div>
      )}

      {trackedRumor && stats.bearing && (
        <div className="compass" aria-live="polite">
          <div className="compass-dial">
            <span className="compass-arrow" style={{ transform: `rotate(${-stats.bearing.angle}rad)` }}>▲</span>
          </div>
          <div>
            <span className="label">Siguiendo pista</span>
            <strong>{trackedRumor.title}</strong>
            <span className="sub">a {fmt(stats.bearing.km, 0)} km</span>
          </div>
        </div>
      )}

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
