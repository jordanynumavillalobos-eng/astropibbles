import { useRef, useState } from 'react'
import gsap from 'gsap'
import './Welcome.css'

// Pantalla de bienvenida de Pibble (diseño original de Jordan, PR #1).
// Al pulsar "Comenzar aventura" se desvanece y deja ver la Luna.
export default function Welcome({ onStart }) {
  const [iniciada, setIniciada] = useState(false)
  const root = useRef()

  const start = () => {
    if (iniciada) return
    setIniciada(true)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(root.current, {
      opacity: 0,
      scale: 1.08,
      duration: reduce ? 0 : 0.9,
      delay: reduce ? 0 : 1.2,
      ease: 'power2.in',
      onComplete: onStart,
    })
  }

  return (
    <main ref={root} className="welcome">
      <div className="estrellas"></div>

      <section className="bienvenida">
        <span className="etiqueta">NASA SPACE APPS CHALLENGE</span>

        <div className="planeta" aria-hidden="true">🪐</div>

        <h1>ASTROPIBBLES</h1>
        <h2>Relatos del Espacio</h2>

        <p>
          ¡Hola, explorador! Soy Pibble y te acompañaré
          a descubrir las increíbles historias de las
          misiones espaciales.
        </p>

        <button onClick={start} autoFocus>
          🚀 ¡Comenzar aventura!
        </button>

        {iniciada && (
          <p className="mensaje" role="status">
            ¡Prepárate, astronauta! Nuestra primera misión
            está en camino.
          </p>
        )}
      </section>
    </main>
  )
}
