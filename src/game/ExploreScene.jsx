import { useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useMoonTrekTexture } from '../lib/useMoonTrekTexture'
import { latLonToVec3 } from '../lib/geo'
import { R } from './constants'
import Player from './Player'
import { SiteFrame, Retroreflector, LunarRover, Surveyor, Beacon } from './props'

const PROPS = {
  'lrrr-apollo11': Retroreflector,
  'lrv-apollo15': LunarRover,
  surveyor3: Surveyor,
}

// Generador pseudoaleatorio con semilla: el suelo es siempre el mismo.
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Textura de detalle (granitos y mini-cráteres) que se repite muchas veces
// para que el suelo no se vea borroso de cerca.
function useDetailBump() {
  const tex = useMemo(() => {
    const rand = seeded(1969)
    const size = 512
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    const img = ctx.createImageData(size, size)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + rand() * 40
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    for (let k = 0; k < 140; k++) {
      const x = rand() * size
      const y = rand() * size
      const r = 3 + rand() ** 3 * 40
      for (const [dx, dy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {
        const g = ctx.createRadialGradient(x + dx, y + dy, r * 0.2, x + dx, y + dy, r)
        g.addColorStop(0, 'rgba(60,60,60,0.55)')
        g.addColorStop(0.8, 'rgba(120,120,120,0.2)')
        g.addColorStop(0.92, 'rgba(220,220,220,0.5)')
        g.addColorStop(1, 'rgba(128,128,128,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(160, 80)
    t.anisotropy = 8
    return t
  }, [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function MoonSurface() {
  const { texture } = useMoonTrekTexture(3)
  const bump = useDetailBump()
  return (
    <mesh receiveShadow>
      <sphereGeometry args={[R, 512, 256]} />
      <meshStandardMaterial map={texture} bumpMap={bump} bumpScale={3} roughness={1} metalness={0} />
    </mesh>
  )
}

// La Tierra en el cielo, sobre la cara visible de la Luna.
function Earth() {
  const p = latLonToVec3(8, 0, 1500)
  return (
    <mesh position={p}>
      <sphereGeometry args={[25, 48, 32]} />
      <meshStandardMaterial color="#3d74d6" emissive="#1d3f8a" emissiveIntensity={0.35} roughness={0.6} />
    </mesh>
  )
}

export default function ExploreScene({ artifacts, paused, onNear, onInteract }) {
  const sites = useMemo(
    () => artifacts.map((a) => ({ ...a, position: latLonToVec3(a.lat, a.lon, R) })),
    [artifacts],
  )
  return (
    <Canvas shadows camera={{ fov: 55, near: 0.1, far: 4000 }} dpr={[1, 2]} aria-label="Luna explorable con Pibble">
      <color attach="background" args={['#03040a']} />
      <Stars radius={1200} depth={200} count={7000} factor={18} saturation={0} fade speed={0.3} />
      <hemisphereLight args={['#cfd8ff', '#1a1a1f', 0.3]} />
      <ambientLight intensity={0.06} />
      <MoonSurface />
      <Earth />
      {sites.map((s) => {
        const Prop = PROPS[s.id]
        return (
          <SiteFrame key={s.id} lat={s.lat} lon={s.lon} yaw={0.6}>
            {Prop && <Prop />}
            {s.id === 'lrrr-apollo11' && <Beacon color={s.color} />}
          </SiteFrame>
        )
      })}
      <Player sites={sites} paused={paused} onNear={onNear} onInteract={onInteract} />
    </Canvas>
  )
}
