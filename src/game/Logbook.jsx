import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { logLinks } from '../data/log'

// Tablero de la bitácora: tarjetas unidas por hilos. Lo desconocido aparece como "?".
export default function Logbook({ artifacts, progress, onClose, onOpenStory }) {
  const root = useRef()
  const byId = Object.fromEntries(progress.entries.map((e) => [e.id, e]))
  const art = Object.fromEntries(artifacts.map((a) => [a.id, a]))

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.log-card', { scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.7)' })
      gsap.from('.log-links line', { opacity: 0, duration: 0.6, delay: 0.3 })
    }, root)
    return () => ctx.revert()
  }, [])

  const visibleLinks = logLinks.filter(([a, b]) => byId[a]?.unlocked && byId[b])

  return (
    <div ref={root} className="logbook" role="dialog" aria-modal="true" aria-labelledby="log-title">
      <header className="log-head">
        <h2 id="log-title">📓 Bitácora de Pibble</h2>
        <p>Cada descubrimiento abre una nueva pista. Elige una pista para seguirla con la brújula.</p>
        <div className="log-actions">
          <button
            className="link"
            onClick={() => {
              if (confirm('¿Borrar todo el progreso y empezar de cero?')) progress.reset()
            }}
          >
            Reiniciar
          </button>
          <button onClick={onClose}>Cerrar (B)</button>
        </div>
      </header>

      <div className="log-board">
        <svg className="log-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {visibleLinks.map(([a, b]) => {
            const A = byId[a].pos
            const B = byId[b].pos
            const known = byId[b].unlocked
            return <line key={a + b} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} className={known ? 'known' : 'unknown'} vectorEffect="non-scaling-stroke" />
          })}
        </svg>

        {progress.entries.map((e) => {
          // Mostrar solo lo desbloqueado, y como "?" lo que señala una pista conocida.
          const hinted = visibleLinks.some(([, b]) => b === e.id)
          if (!e.unlocked && !hinted) return null
          const style = { left: `${e.pos[0]}%`, top: `${e.pos[1]}%` }

          if (!e.unlocked) {
            return (
              <div key={e.id} className="log-card mystery" style={style}>
                <span className="q">?</span>
              </div>
            )
          }

          if (e.kind === 'artifact') {
            const a = art[e.id]
            return (
              <div key={e.id} className={`log-card artifact ${e.resolved ? 'done' : ''}`} style={{ ...style, '--ghost': a.color }}>
                <span className="kind">Máquina encontrada</span>
                <strong>{a.nickname}</strong>
                <small>{a.name}</small>
                <button onClick={() => onOpenStory(a.id)}>{e.resolved ? 'Releer historia' : 'Leer historia'}</button>
              </div>
            )
          }

          const tracked = progress.tracked === e.id && !e.resolved
          return (
            <div key={e.id} className={`log-card rumor ${e.resolved ? 'done' : ''} ${tracked ? 'tracked' : ''} ${e.kind}`} style={style}>
              <span className="kind">{e.kind === 'teaser' ? 'Próximamente' : e.resolved ? 'Pista resuelta' : 'Pista'}</span>
              <strong>{e.title}</strong>
              <p>{e.text}</p>
              {e.kind === 'rumor' && !e.resolved && (
                <button onClick={() => progress.track(e.id)} aria-pressed={tracked}>
                  {tracked ? '🧭 Siguiendo' : 'Seguir pista'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
