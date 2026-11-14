import { useCallback, useEffect, useMemo, useState } from 'react'
import { logEntries } from '../data/log'

const KEY = 'astropibbles.progress.v1'
const EMPTY = { found: [], read: [], tracked: 'r-destello', completedSeen: false }

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    return EMPTY
  }
}

// Progreso del jugador: qué máquinas encontró, qué historias leyó y qué pista sigue.
// Se guarda en el navegador para poder continuar otro día.
export function useProgress() {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* sin almacenamiento: el juego funciona igual */
    }
  }, [state])

  const derived = useMemo(() => {
    const found = new Set(state.found)
    const read = new Set(state.read)
    const unlocked = (e) => !e.unlockedBy || read.has(e.unlockedBy)
    const entries = logEntries.map((e) => ({
      ...e,
      unlocked: e.kind === 'artifact' || e.kind === 'bonus' ? found.has(e.id) : unlocked(e),
      resolved: e.kind === 'rumor' ? found.has(e.target) : e.kind === 'artifact' ? read.has(e.id) : false,
    }))
    return { found, read, entries, complete: logEntries.filter((e) => e.kind === 'artifact').every((e) => read.has(e.id)) }
  }, [state])

  const markFound = useCallback((id) => {
    setState((s) => (s.found.includes(id) ? s : { ...s, found: [...s.found, id] }))
  }, [])

  // Al leer una historia se desbloquean rumores; se sigue automáticamente el nuevo.
  const markRead = useCallback((id) => {
    const next = logEntries.find((e) => e.unlockedBy === id && e.kind === 'rumor')
    setState((s) =>
      s.read.includes(id) ? s : { ...s, read: [...s.read, id], tracked: next ? next.id : s.tracked },
    )
  }, [])

  const track = useCallback((id) => setState((s) => ({ ...s, tracked: id })), [])
  const setCompletedSeen = useCallback(() => setState((s) => ({ ...s, completedSeen: true })), [])
  const reset = useCallback(() => setState(EMPTY), [])

  return { ...derived, tracked: state.tracked, completedSeen: state.completedSeen, markFound, markRead, track, setCompletedSeen, reset }
}
