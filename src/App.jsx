import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { artifacts } from './data/artifacts'
import { logEntries, discoveryLines } from './data/log'
import MoonScene from './components/MoonScene'
import StoryPanel from './components/StoryPanel'
import Welcome from './components/Welcome'
import ExploreScene from './game/ExploreScene'
import Hud from './game/Hud'
import Logbook from './game/Logbook'
import Toasts from './game/Toasts'
import { useToasts } from './game/useToasts'
import { bindKeyboard } from './game/input'
import { game, spawn, latLonOf } from './game/store'
import { useProgress } from './game/progress'

// Pibble aterriza en el Mar de la Tranquilidad, a unos 250 km reales del Apolo 11,
// mirando de reojo hacia el destello del retrorreflector.
spawn(4, 31, 0.67345, 23.47307, 0.18)

const artById = Object.fromEntries(artifacts.map((a) => [a.id, a]))

export default function App() {
  const [mode, setMode] = useState('welcome') // welcome | explore | map
  const [selectedId, setSelectedId] = useState(null)
  const [logOpen, setLogOpen] = useState(false)
  const [newLog, setNewLog] = useState(false)
  const [nearId, setNearId] = useState(null)
  const [tiles, setTiles] = useState(null)
  const [pibbleOnMap, setPibbleOnMap] = useState(null)
  const progress = useProgress()
  const { toasts, push } = useToasts()
  const selected = artById[selectedId] ?? null
  const showEnding = progress.complete && !progress.completedSeen && !selected && !logOpen && mode === 'explore'

  // La callback de cercanía se llama desde el bucle 3D: lee el progreso más reciente.
  const latest = useRef(progress)
  useEffect(() => {
    latest.current = progress
  }, [progress])

  const onNear = useCallback(
    (id) => {
      setNearId(id)
      if (!id || latest.current.found.has(id)) return
      latest.current.markFound(id)
      const a = artById[id]
      push({ kind: 'found', label: '¡Descubrimiento!', title: a.nickname, text: discoveryLines[id], color: a.color })
    },
    [push],
  )

  const openStory = useCallback((id) => {
    setLogOpen(false)
    setSelectedId(id)
  }, [])

  const selRef = useRef(null)
  useEffect(() => {
    selRef.current = selectedId
  }, [selectedId])

  // Al cerrar una historia por primera vez se desbloquean pistas nuevas.
  const closeStory = useCallback(() => {
    const id = selRef.current
    if (id && !latest.current.read.has(id)) {
      latest.current.markRead(id)
      for (const e of logEntries.filter((x) => x.unlockedBy === id)) {
        push({
          kind: 'log',
          label: e.kind === 'teaser' ? '📓 Bitácora' : '📓 Nueva pista',
          title: e.title,
          text: 'Pulsa B para verla en la bitácora.',
        })
        setNewLog(true)
      }
    }
    selRef.current = null
    setSelectedId(null)
  }, [push])

  const toggleMap = useCallback(() => {
    setSelectedId(null)
    setLogOpen(false)
    setMode((m) => {
      if (m === 'map') return 'explore'
      setPibbleOnMap(latLonOf(game.n))
      return 'map'
    })
  }, [])

  const toggleLog = useCallback(() => {
    setLogOpen((o) => !o)
    setNewLog(false)
  }, [])

  useEffect(() => {
    if (mode === 'welcome') return
    const unbind = bindKeyboard()
    const onKey = (e) => {
      if (e.repeat) return
      if (e.key === 'Escape') {
        setLogOpen(false)
        closeStory()
      }
      if (e.code === 'KeyM') toggleMap()
      if (e.code === 'KeyB' && mode === 'explore') {
        closeStory()
        toggleLog()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      unbind()
      window.removeEventListener('keydown', onKey)
    }
  }, [mode, closeStory, toggleMap, toggleLog])

  const beacons = useMemo(() => {
    const s = new Set(['lrrr-apollo11'])
    if (progress.read.has('lrrr-apollo11')) s.add('lrv-apollo15')
    return s
  }, [progress.read])

  const trackedRumor = progress.entries.find((e) => e.id === progress.tracked && e.unlocked && !e.resolved && e.kind === 'rumor') ?? null
  const discovered = artifacts.filter((a) => progress.found.has(a.id))

  return (
    <div className={`app mode-${mode} ${selected ? 'has-story' : ''}`}>
      {mode !== 'map' && (
        <div className="stage">
          <ExploreScene
            artifacts={artifacts}
            beacons={beacons}
            paused={!!selected || logOpen || showEnding || mode !== 'explore'}
            onNear={onNear}
            onInteract={openStory}
          />
        </div>
      )}

      {mode === 'explore' && !selected && !logOpen && (
        <Hud
          artifacts={artifacts}
          nearId={nearId}
          trackedRumor={trackedRumor}
          newLog={newLog}
          onInteract={openStory}
          onMap={toggleMap}
          onLog={toggleLog}
        />
      )}

      {mode === 'map' && (
        <>
          <div className="stage">
            <MoonScene artifacts={discovered} selected={selected} onSelect={setSelectedId} onTileStatus={setTiles} pibble={pibbleOnMap} />
          </div>
          <header className="brand">
            <h1>Abandonados<span>, no olvidados</span></h1>
            <p>Las máquinas que NASA dejó en la Luna cuentan su historia.</p>
          </header>
          {!selected && (
            <nav className="roster" aria-label="Máquinas descubiertas">
              <button className="back-explore" onClick={toggleMap}>🐾 Volver a explorar (M)</button>
              <ul>
                {artifacts.map((a) =>
                  progress.found.has(a.id) ? (
                    <li key={a.id}>
                      <button style={{ '--ghost': a.color }} onClick={() => setSelectedId(a.id)}>
                        <span className="dot" />
                        <span>
                          <strong>{a.nickname}</strong>
                          <small>{a.name} · {a.year}</small>
                        </span>
                      </button>
                    </li>
                  ) : (
                    <li key={a.id}>
                      <button disabled className="unknown">
                        <span className="dot" />
                        <span>
                          <strong>???</strong>
                          <small>Sin descubrir</small>
                        </span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          )}
          <footer className="credit">
            Mapa: mosaico LRO WAC · <a href="https://trek.nasa.gov/moon/" target="_blank" rel="noreferrer">NASA Moon Trek</a>
            {tiles && tiles.failed > 0 && <span className="warn"> · {tiles.failed} teselas sin cargar</span>}
          </footer>
        </>
      )}

      {logOpen && <Logbook artifacts={artifacts} progress={progress} onClose={toggleLog} onOpenStory={openStory} />}

      {selected && <StoryPanel key={selected.id} artifact={selected} onClose={closeStory} />}

      {showEnding && (
        <div className="ending" role="dialog" aria-modal="true" aria-labelledby="ending-title">
          <div className="ending-card">
            <p className="eyebrow">Misión lunar completada</p>
            <h2 id="ending-title">¡Las tres máquinas te contaron su historia!</h2>
            <ul>
              {artifacts.map((a) => (
                <li key={a.id} style={{ '--ghost': a.color }}>
                  <span className="dot" /> <strong>{a.nickname}</strong> · {a.mission}, {a.year}
                </li>
              ))}
            </ul>
            <p>
              Ninguna está olvidada: el retrorreflector aún devuelve la luz, el rover sigue aparcado en Hadley y las piezas del
              Surveyor 3 viajaron de vuelta a la Tierra con el Apolo 12.
            </p>
            <p className="teaser">Próxima misión de Pibble: Marte.</p>
            <button onClick={progress.setCompletedSeen}>Seguir explorando la Luna</button>
          </div>
        </div>
      )}

      <Toasts toasts={toasts} />

      {mode === 'welcome' && <Welcome onStart={() => setMode('explore')} />}
    </div>
  )
}
