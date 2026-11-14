import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import Pibble from './Pibble'
import { game } from './store'

// Vista de personaje (abrir con ?pibble): para revisar y ajustar el modelo de Pibble.
export default function PibblePreview() {
  const [pose, setPose] = useState('idle')
  const set = (p) => {
    setPose(p)
    Object.assign(game, { moving: p === 'walk', grounded: p !== 'jump', nearId: p === 'wave' ? 'x' : null, vehicle: null })
  }
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas shadows camera={{ position: [0, 1.1, 3.2], fov: 35 }} onCreated={() => set('idle')}>
        <color attach="background" args={['#101734']} />
        <hemisphereLight args={['#dfe6ff', '#2a2a33', 0.8]} />
        <directionalLight position={[2, 4, 3]} intensity={2.2} castShadow />
        <Walker pose={pose} />
        <ContactShadows position={[0, 0, 0]} opacity={0.5} blur={2} far={2} />
        <OrbitControls target={[0, 0.8, 0]} />
      </Canvas>
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {['idle', 'walk', 'jump', 'wave'].map((p) => (
          <button key={p} onClick={() => set(p)} aria-pressed={pose === p}
            style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid #fff4', background: pose === p ? '#ff8a3d' : '#0008', color: '#fff' }}>
            {{ idle: 'Quieto', walk: 'Caminar', jump: 'Saltar', wave: 'Saludar' }[p]}
          </button>
        ))}
      </div>
    </div>
  )
}

function Walker({ pose }) {
  // Avanza la fase de caminar para ver la animación sin moverse.
  return (
    <group>
      <PhaseTicker active={pose === 'walk'} />
      <Pibble />
    </group>
  )
}

function PhaseTicker({ active }) {
  useFrame((_, dt) => {
    if (active) game.phase += dt * 10
  })
  return null
}
