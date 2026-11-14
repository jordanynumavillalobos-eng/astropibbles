import { useCallback, useEffect, useState } from 'react'
import { artifacts } from './data/artifacts'
import MoonScene from './components/MoonScene'
import StoryPanel from './components/StoryPanel'
import Welcome from './components/Welcome'

export default function App() {
  const [started, setStarted] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [tiles, setTiles] = useState(null)
  const selected = artifacts.find((a) => a.id === selectedId) ?? null

  const onSelect = useCallback((id) => setSelectedId(id), [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSelectedId(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={`app ${selected ? 'has-story' : ''}`}>
      <div className="stage">
        <MoonScene artifacts={artifacts} selected={selected} onSelect={onSelect} onTileStatus={setTiles} />
      </div>

      <header className="brand">
        <h1>Abandonados<span>, no olvidados</span></h1>
        <p>Las máquinas que NASA dejó en la Luna cuentan su historia.</p>
      </header>

      {!selected && (
        <nav className="roster" aria-label="Artefactos">
          <p className="roster-hint">Toca un fantasma en la Luna o elige uno:</p>
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

      {selected && <StoryPanel key={selected.id} artifact={selected} onClose={() => onSelect(null)} />}

      <footer className="credit">
        Mapa: mosaico LRO WAC · <a href="https://trek.nasa.gov/moon/" target="_blank" rel="noreferrer">NASA Moon Trek</a>
        {tiles && tiles.failed > 0 && <span className="warn"> · {tiles.failed} teselas sin cargar</span>}
      </footer>

      {/* La Luna carga sus teselas por detrás mientras Pibble da la bienvenida. */}
      {!started && <Welcome onStart={() => setStarted(true)} />}
    </div>
  )
}
