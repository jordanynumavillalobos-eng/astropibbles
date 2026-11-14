import { useCallback, useEffect, useState } from 'react'
import { artifacts } from './data/artifacts'
import MoonScene from './components/MoonScene'
import StoryPanel from './components/StoryPanel'
import Welcome from './components/Welcome'
import ExploreScene from './game/ExploreScene'
import Hud from './game/Hud'
import { bindKeyboard } from './game/input'
import { spawn } from './game/store'

// Pibble aterriza en el Mar de la Tranquilidad, a unos 250 km reales del Apolo 11,
// mirando de reojo hacia el destello del retrorreflector.
spawn(4, 31, 0.67345, 23.47307, 0.18)

export default function App() {
  const [mode, setMode] = useState('welcome') // welcome | explore | map
  const [selectedId, setSelectedId] = useState(null)
  const [nearId, setNearId] = useState(null)
  const [tiles, setTiles] = useState(null)
  const selected = artifacts.find((a) => a.id === selectedId) ?? null

  const onSelect = useCallback((id) => setSelectedId(id), [])

  useEffect(() => {
    if (mode === 'welcome') return
    const unbind = bindKeyboard()
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedId(null)
      if (e.code === 'KeyM' && !e.repeat) {
        setSelectedId(null)
        setMode((m) => (m === 'map' ? 'explore' : 'map'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      unbind()
      window.removeEventListener('keydown', onKey)
    }
  }, [mode])

  return (
    <div className={`app mode-${mode} ${selected ? 'has-story' : ''}`}>
      {mode !== 'map' && (
        <div className="stage">
          <ExploreScene artifacts={artifacts} paused={!!selected || mode !== 'explore'} onNear={setNearId} onInteract={onSelect} />
        </div>
      )}

      {mode === 'explore' && !selected && (
        <Hud artifacts={artifacts} nearId={nearId} onInteract={onSelect} onMap={() => setMode('map')} />
      )}

      {mode === 'map' && (
        <>
          <div className="stage">
            <MoonScene artifacts={artifacts} selected={selected} onSelect={onSelect} onTileStatus={setTiles} />
          </div>
          <header className="brand">
            <h1>Abandonados<span>, no olvidados</span></h1>
            <p>Las máquinas que NASA dejó en la Luna cuentan su historia.</p>
          </header>
          {!selected && (
            <nav className="roster" aria-label="Artefactos">
              <button className="back-explore" onClick={() => setMode('explore')}>🐾 Volver a explorar (M)</button>
              <ul>
                {artifacts.map((a) => (
                  <li key={a.id}>
                    <button style={{ '--ghost': a.color }} onClick={() => onSelect(a.id)}>
                      <span className="dot" />
                      <span>
                        <strong>{a.nickname}</strong>
                        <small>{a.name} · {a.year}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <footer className="credit">
            Mapa: mosaico LRO WAC · <a href="https://trek.nasa.gov/moon/" target="_blank" rel="noreferrer">NASA Moon Trek</a>
            {tiles && tiles.failed > 0 && <span className="warn"> · {tiles.failed} teselas sin cargar</span>}
          </footer>
        </>
      )}

      {selected && <StoryPanel key={selected.id} artifact={selected} onClose={() => onSelect(null)} />}

      {mode === 'welcome' && <Welcome onStart={() => setMode('explore')} />}
    </div>
  )
}
