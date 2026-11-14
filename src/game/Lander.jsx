import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { game } from './store'

const GOLD = { color: '#d9a441', metalness: 0.8, roughness: 0.3 }
const METAL = { color: '#c8ccd4', metalness: 0.7, roughness: 0.35 }

// El saltador de Pibble: una cabina abierta sobre tres patas, con un motor debajo.
export default function Lander({ active }) {
  const flame = useRef()
  useFrame(({ clock }) => {
    const on = active && game.thrusting
    const s = on ? 1 + Math.sin(clock.elapsedTime * 40) * 0.15 : 0.001
    flame.current.scale.set(s, on ? s * 1.4 : 0.001, s)
    flame.current.visible = on
  })
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i / 3) * Math.PI * 2 + 0.5, 0]}>
          <mesh position={[0, 0.45, 0.85]} rotation={[0.7, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.1]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
          <mesh position={[0, 0.04, 1.2]} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.06, 12]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
        </group>
      ))}
      {/* cuerpo dorado */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.7, 0.55, 8]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* anillo de la cabina (Pibble va de pie dentro) */}
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.72, 0.07, 8, 24]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* tobera */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.18, 0.32, 0.3, 16, 1, true]} />
        <meshStandardMaterial color="#555b66" metalness={0.8} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={flame} position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.28, 0.9, 16, 1, true]} />
        <meshBasicMaterial color="#9fd8ff" transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* luz de posición */}
      <mesh position={[0, 1.3, -0.72]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color="#ff8a3d" />
      </mesh>
    </group>
  )
}
