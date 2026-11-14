import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { game } from './store'
import { setTouch, input } from './input'
import { sfx, isMuted, setMuted } from './audio'
import { unitsToRealKm, EARTH_JUMP_M, MOON_RADIUS_KM, SAFE_LANDING } from './constants'
import { latLonToVec3 } from '../lib/geo'
import { reflectors } from '../data/artifacts'

const fmt = (n, d = 1) => n.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d })
const tangent = new THREE.Vector3()
const cross = new THREE.Vector3()
const REFLECTOR_DIRS = reflectors.map((r) => latLonToVec3(r.lat, r.lon, 1))
const PING_EVERY = 2.5 // s

// Ángulo (rad, + = a la izquierda) y distancia real (km) desde Pibble hasta un punto.
function bearingTo(target) {
  const cos = THREE.MathUtils.clamp(game.n.dot(target), -1, 1)
  tangent.copy(target).addScaledVector(game.n, -cos).normalize()
  const angle = Math.atan2(cross.crossVectors(game.f, tangent).dot(game.n), game.f.dot(tangent))
  return { angle, km: Math.acos(cos) * MOON_RADIUS_KM }
}

// Intensidad del eco: hay que mirar hacia el retrorreflector (y no estar muy lejos).
function signalStrength() {
  let best = 0
  for (const d of REFLECTOR_DIRS) {
    const { angle, km } = bearingTo(d)
    const aim = Math.max(0, Math.cos(angle)) ** 4
    const range = Math.max(0, 1 - km / 2600)
    best = Math.max(best, aim * range)
  }
  return best
}

function TouchPad({ inLander }) {
  const hold = (axis, value) => ({
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      setTouch(axis, value)
    },
    onPointerUp: () => setTouch(axis, axis === 'thrust' ? false : 0),
    onPointerCancel: () => setTouch(axis, axis === 'thrust' ? false : 0),
  })
  return (
    <div className="touchpad" aria-hidden="true">
      <div className="dpad">
        <button className="up" {...hold('forward', 1)}>▲</button>
        <button className="left" {...hold('turn', 1)}>◀</button>
        <button className="right" {...hold('turn', -1)}>▶</button>
        <button className="down" {...hold('forward', -1)}>▼</button>
      </div>
      {inLander ? (
        <button className="jump" {...hold('thrust', true)}>Motor</button>
      ) : (
        <button className="jump" onPointerDown={() => (input.jumpQueued = true)}>Saltar</button>
      )}
      <button className="act" onPointerDown={() => (input.interactQueued = true)}>E</button>
      <button className="recv" onPointerDown={() => (input.receiver = !input.receiver)}>📡</button>
    </div>
  )
}

export default function Hud({ artifacts, nearId, trackedRumor, newLog, onInteract, onMap, onLog }) {
  const [s, setS] = useState({ km: 0, jump: 0, bearing: null, receiver: false, signal: 0, inLander: false, nearLander: false, fuel: 1, vy: 0, alt: 0, grounded: true })
  const [help, setHelp] = useState(true)
  const [muted, setMutedState] = useState(isMuted)
  const pingClock = useRef(0)
  const near = artifacts.find((a) => a.id === nearId)
  const targetArt = trackedRumor && artifacts.find((a) => a.id === trackedRumor.target)

  useEffect(() => {
    const target = targetArt ? latLonToVec3(targetArt.lat, targetArt.lon, 1) : null
    const TICK = 120
    const id = setInterval(() => {
      const signal = input.receiver ? signalStrength() : 0
      if (input.receiver) {
        pingClock.current += TICK / 1000
        if (pingClock.current >= PING_EVERY) {
          pingClock.current = 0
          if (signal > 0.02) sfx.ping(signal)
        }
      }
      setS({
        km: unitsToRealKm(game.distance),
        jump: game.lastJump,
        bearing: target ? bearingTo(target) : null,
        receiver: input.receiver,
        signal,
        inLander: game.vehicle === 'lander',
        nearLander: game.nearLander,
        fuel: game.fuel,
        vy: game.vy,
        alt: game.h,
        grounded: game.grounded,
      })
    }, TICK)
    return () => clearInterval(id)
  }, [targetArt])

  const toggleMute = () => {
    setMuted(!muted)
    setMutedState(!muted)
  }

  const falling = !s.grounded && s.vy < -SAFE_LANDING

  return (
    <div className="hud">
      <div className="hud-top">
        <span className="hud-brand">ASTROPIBBLES</span>
        <div className="hud-actions">
          <button onClick={toggleMute} aria-pressed={muted} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>{muted ? '🔇' : '🔊'}</button>
          <button onClick={() => setHelp((h) => !h)} aria-expanded={help}>Controles</button>
          <button onClick={onLog} className={newLog ? 'has-new' : ''}>📓 Bitácora (B)</button>
          <button onClick={onMap}>🗺 Mapa (M)</button>
        </div>
      </div>

      {help && (
        <div className="hud-help" role="note">
          <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas: caminar y girar</p>
          <p><kbd>Shift</kbd>: correr · <kbd>Espacio</kbd>: saltar · <kbd>E</kbd>: examinar / subir</p>
          <p><kbd>Q</kbd>: receptor de señales · <kbd>B</kbd>: bitácora · <kbd>M</kbd>: mapa</p>
          <p className="note">En la Luna no hay aire, así que el sonido no viaja: lo que oyes llega por la radio y el traje de Pibble.</p>
          <button className="link" onClick={() => setHelp(false)}>Entendido</button>
        </div>
      )}

      {trackedRumor && s.bearing && (
        <div className="compass" aria-live="polite">
          <div className="compass-dial">
            <span className="compass-arrow" style={{ transform: `rotate(${-s.bearing.angle}rad)` }}>▲</span>
          </div>
          <div>
            <span className="label">Siguiendo pista</span>
            <strong>{trackedRumor.title}</strong>
            <span className="sub">a {fmt(s.bearing.km, 0)} km</span>
          </div>
        </div>
      )}

      {s.receiver && (
        <div className="receiver" aria-live="polite">
          <span className="label">📡 Receptor de ecos láser</span>
          <div className="meter" aria-label={`Señal ${Math.round(s.signal * 100)} %`}>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={i < Math.round(s.signal * 10) ? 'on' : ''} />
            ))}
          </div>
          <span className="sub">
            {s.signal > 0.6 ? '¡Eco fuerte! Sigue recto.' : s.signal > 0.15 ? 'Hay eco… gira hasta que suene más fuerte.' : 'Sin eco. Gira despacio para buscar.'}
          </span>
        </div>
      )}

      {s.inLander && (
        <div className={`lander-panel ${falling ? 'warn' : ''}`}>
          <span className="label">Saltador lunar</span>
          <div className="fuel"><span style={{ width: `${s.fuel * 100}%` }} /></div>
          <p>Altura <strong>{fmt(s.alt)} m</strong> · Vertical <strong>{fmt(s.vy)} m/s</strong></p>
          <p className="sub">
            {falling ? '¡Demasiado rápido! Usa el motor para frenar.' : s.grounded ? 'Mantén Espacio para despegar · E para bajar' : 'Aterriza a menos de 2,2 m/s o rebotarás.'}
          </p>
        </div>
      )}

      <div className="hud-stats">
        <p>
          <span className="label">Recorrido</span>
          <strong>{fmt(s.km, 0)} km</strong>
          <span className="sub">de superficie lunar real</span>
        </p>
        {s.jump > 0 && !s.inLander && (
          <p>
            <span className="label">Último salto</span>
            <strong>{fmt(s.jump)} m</strong>
            <span className="sub">en la Tierra: {fmt(EARTH_JUMP_M)} m · gravedad lunar 1,62 m/s²</span>
          </p>
        )}
      </div>

      {near && !s.inLander && (
        <button className="hud-prompt" style={{ '--ghost': near.color }} onClick={() => onInteract(near.id)}>
          <kbd>E</kbd> Examinar <strong>{near.nickname}</strong>
        </button>
      )}
      {!near && s.nearLander && (
        <button className="hud-prompt" style={{ '--ghost': '#ff8a3d' }} onClick={() => (input.interactQueued = true)}>
          <kbd>E</kbd> Subir al <strong>saltador</strong>
        </button>
      )}

      <TouchPad inLander={s.inLander} />
    </div>
  )
}
