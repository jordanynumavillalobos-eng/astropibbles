import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { MOON_TREK_TILE } from '../data/artifacts'

const TILE = 256

// Construye la textura de la Luna a partir de las teselas WMTS oficiales de
// NASA Moon Trek (mosaico global LRO WAC). Mientras cargan, se ve un gris liso.
export function useMoonTrekTexture(level = 2) {
  const cols = 2 * 2 ** level
  const rows = 2 ** level

  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = cols * TILE
    canvas.height = rows * TILE
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#6f6f6f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return { canvas, texture }
  }, [cols, rows])

  const [status, setStatus] = useState({ loaded: 0, failed: 0, total: cols * rows })

  useEffect(() => {
    const ctx = canvas.getContext('2d')
    let cancelled = false
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          if (cancelled) return
          ctx.drawImage(img, c * TILE, r * TILE, TILE, TILE)
          texture.needsUpdate = true
          setStatus((s) => ({ ...s, loaded: s.loaded + 1 }))
        }
        img.onerror = () => {
          if (!cancelled) setStatus((s) => ({ ...s, failed: s.failed + 1 }))
        }
        img.src = MOON_TREK_TILE(level, r, c)
      }
    }
    return () => {
      cancelled = true
    }
  }, [canvas, texture, cols, rows, level])

  useEffect(() => () => texture.dispose(), [texture])

  return { texture, status }
}
