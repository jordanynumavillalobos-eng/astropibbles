import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useMoonTrekTexture } from '../lib/useMoonTrekTexture'
import { latLonToVec3 } from '../lib/geo'
import GhostMarker from './GhostMarker'
import CameraRig from './CameraRig'

function Moon({ onTileStatus }) {
  const { texture, status } = useMoonTrekTexture(2)
  useEffect(() => onTileStatus?.(status), [status, onTileStatus])
  return (
    <mesh onClick={(e) => e.stopPropagation()}>
      <sphereGeometry args={[1, 128, 64]} />
      <meshStandardMaterial map={texture} roughness={1} metalness={0} />
    </mesh>
  )
}

const noop = () => {}

export default function MoonScene({ artifacts, selected, onSelect, onTileStatus, pibble }) {
  const start = pibble ? latLonToVec3(pibble.lat, pibble.lon, 3.4) : latLonToVec3(15, 10, 3.4)
  return (
    <Canvas
      camera={{ position: [start.x, start.y, start.z], fov: 40, near: 0.01, far: 200 }}
      dpr={[1, 2]}
      onPointerMissed={() => onSelect(null)}
      aria-label="Globo 3D de la Luna con los sitios de los artefactos"
    >
      <color attach="background" args={['#04050b']} />
      <Stars radius={60} depth={30} count={4000} factor={3} saturation={0} fade speed={0.4} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 2, 4]} intensity={2.4} />
      <Moon onTileStatus={onTileStatus} />
      {artifacts.map((a) => (
        <GhostMarker key={a.id} artifact={a} selected={selected?.id === a.id} onSelect={onSelect} />
      ))}
      {pibble && (
        <GhostMarker
          artifact={{ id: 'pibble', nickname: '🐾 Pibble', color: '#ff8a3d', status: 'active', ...pibble }}
          selected={false}
          onSelect={noop}
        />
      )}
      <CameraRig target={selected} />
    </Canvas>
  )
}
