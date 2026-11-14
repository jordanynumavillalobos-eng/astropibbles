import { useCallback, useState } from 'react'

let nextId = 1

// Avisos breves: descubrimientos y pistas nuevas.
export function useToasts() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((toast) => {
    const id = nextId++
    setToasts((t) => [...t, { id, ...toast }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), toast.duration ?? 5000)
  }, [])
  return { toasts, push }
}
