import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Html } from '@react-three/drei'
import * as THREE from 'three'
import { latLonToVec3 } from '../lib/geo'

const UP = new THREE.Vector3(0, 1, 0)
const tmp = new THREE.Vector3()

// Un "fantasma": un haz de luz que sale del sitio de aterrizaje real,
// con un anillo que late. Más intenso si el artefacto sigue activo.
export default function GhostMarker({ artifact, selected, onSelect }) {
  const normal = useMemo(() => latLonToVec3(artifact.lat, artifact.lon, 1), [artifact])
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(UP, normal), [normal])
  const ring = useRef()
  const beam = useRef()
  const label = useRef()
  const [hovered, setHovered] = useState(false)
  const active = artifact.status === 'active'

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    const pulse = (t * (active ? 1.2 : 0.6)) % 1
    if (ring.current) {
      const s = 0.02 + pulse * 0.06
      ring.current.scale.setScalar(s / 0.02)
      ring.current.material.opacity = (1 - pulse) * 0.9
    }
    if (beam.current) {
      beam.current.material.opacity = (active ? 0.55 : 0.3) + Math.sin(t * 3) * 0.1
    }
    // Ocultar la etiqueta cuando el sitio queda en la cara oculta.
    // (se cambia el estilo directamente: desmontar <Html> en cada frame rompe React)
    if (label.current) {
      const visible = tmp.copy(camera.position).normalize().dot(normal) > 0.25
      label.current.style.opacity = visible ? '1' : '0'
      label.current.style.pointerEvents = visible ? 'auto' : 'none'
    }
  })

  const color = new THREE.Color(artifact.color)
  const big = hovered || selected

  return (
    <group position={normal} quaternion={quaternion}>
      {/* haz vertical */}
      <mesh ref={beam} position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.002, 0.008, 0.14, 12, 1, true]} />
        <meshBasicMaterial color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* núcleo clicable (zona de clic más grande que lo visible) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(artifact.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh scale={big ? 1.6 : 1}>
        <sphereGeometry args={[0.009, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* anillo pulsante, siempre de cara a la cámara */}
      <Billboard>
        <mesh ref={ring}>
          <ringGeometry args={[0.016, 0.02, 40]} />
          <meshBasicMaterial color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </Billboard>
      <Html position={[0, 0.16, 0]} center distanceFactor={2.4} zIndexRange={[10, 0]}>
          <button
            ref={label}
            className={`ghost-label ${big ? 'is-big' : ''}`}
            style={{ '--ghost': artifact.color }}
            onClick={() => onSelect(artifact.id)}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            {artifact.nickname}
          </button>
      </Html>
    </group>
  )
}
