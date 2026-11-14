import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Historia en primera persona, contada por capítulos que aparecen al hacer scroll.
export default function StoryPanel({ artifact, onClose }) {
  const root = useRef()
  const scroller = useRef()
  const progress = useRef()
  const [revealed, setRevealed] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useLayoutEffect(() => {
    scroller.current.scrollTop = 0
    const mm = gsap.matchMedia(root)
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)' },
      ({ conditions }) => {
        if (!conditions.motion) return
        gsap.from('.story-head > *', { y: 24, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out', delay: 0.4 })
        gsap.utils.toArray('.chapter, .myth, .sources').forEach((el) => {
          gsap.from(el, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, scroller: scroller.current, start: 'top 88%' },
          })
        })
        gsap.to(progress.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { scroller: scroller.current, trigger: scroller.current.firstElementChild, start: 'top top', end: 'bottom bottom', scrub: true },
        })
      },
    )
    return () => mm.revert()
  }, [artifact.id])

  // Lectura en voz alta (accesibilidad).
  useEffect(() => () => window.speechSynthesis?.cancel(), [artifact.id])
  const toggleSpeak = () => {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const text = [artifact.name, artifact.tagline, ...artifact.chapters.map((c) => `${c.title}. ${c.text}`)].join('. ')
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = 0.95
    u.onend = () => setSpeaking(false)
    synth.speak(u)
    setSpeaking(true)
  }

  return (
    <aside ref={root} className="story" style={{ '--ghost': artifact.color }} aria-labelledby="story-title">
      <div className="story-progress"><div ref={progress} className="story-progress-bar" /></div>
      <div className="story-tools">
        <button onClick={toggleSpeak} aria-pressed={speaking}>{speaking ? '■ Detener' : '🔊 Escuchar'}</button>
        <button onClick={onClose} aria-label="Cerrar historia">✕</button>
      </div>
      <div ref={scroller} className="story-scroll">
        <div>
          <header className="story-head">
            <p className="eyebrow">{artifact.mission} · {artifact.year}</p>
            <h2 id="story-title">{artifact.name}</h2>
            <p className={`status status-${artifact.status}`}>● {artifact.statusLabel}</p>
            <p className="tagline">“{artifact.tagline}”</p>
            <p className="coords">
              {Math.abs(artifact.lat).toFixed(2)}° {artifact.lat >= 0 ? 'N' : 'S'} · {Math.abs(artifact.lon).toFixed(2)}° {artifact.lon >= 0 ? 'E' : 'O'}
            </p>
          </header>

          {artifact.chapters.map((c, i) => (
            <section className="chapter" key={c.title}>
              <span className="chapter-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </section>
          ))}

          <section className="myth">
            <h3>¿Mito o realidad?</h3>
            <p className="myth-claim">{artifact.myth.claim}</p>
            {revealed ? (
              <p className="myth-truth">{artifact.myth.truth}</p>
            ) : (
              <button className="myth-btn" onClick={() => setRevealed(true)}>Descubrir la verdad</button>
            )}
          </section>

          <section className="sources">
            <h3>Fuentes oficiales de NASA</h3>
            <ul>
              {artifact.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </aside>
  )
}
