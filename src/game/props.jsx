import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLonToVec3 } from '../lib/geo'
import { R } from './constants'

const UP = new THREE.Vector3(0, 1, 0)
const METAL = { color: '#c8ccd4', metalness: 0.7, roughness: 0.35 }
const GOLD = { color: '#d9a441', metalness: 0.8, roughness: 0.3 }
const DARK = { color: '#2b2f3a', metalness: 0.3, roughness: 0.6 }

// Sitúa a sus hijos sobre la superficie en (lat, lon), con +Y apuntando "arriba".
export function SiteFrame({ lat, lon, yaw = 0, children }) {
  const { position, quaternion } = useMemo(() => {
    const n = latLonToVec3(lat, lon, 1)
    const q = new THREE.Quaternion().setFromUnitVectors(UP, n)
    q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, yaw))
    return { position: n.multiplyScalar(R), quaternion: q }
  }, [lat, lon, yaw])
  return (
    <group position={position} quaternion={quaternion}>
      {children}
    </group>
  )
}

// Retrorreflector: una placa inclinada llena de cubos reflectores sobre patas.
export function Retroreflector() {
  const cubes = []
  for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) cubes.push([(i - 3.5) * 0.11, (j - 2.5) * 0.11])
  return (
    <group>
      {[[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
      <group position={[0, 0.48, 0]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 0.06, 0.75]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
        {cubes.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.04, z]}>
            <boxGeometry args={[0.09, 0.03, 0.09]} />
            <meshStandardMaterial color="#9fe9ff" metalness={0.9} roughness={0.05} emissive="#0a5566" emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Rover lunar: chasis, 4 ruedas de malla, 2 asientos y antena de paraguas.
export function LunarRover() {
  return (
    <group scale={1.1}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.12, 2.6]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {[[-0.75, 0.9], [0.75, 0.9], [-0.75, -0.9], [0.75, -0.9]].map(([x, z], i) => (
        <group key={i} position={[x, 0.4, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.22, 20]} />
            <meshStandardMaterial color="#8a8f99" metalness={0.6} roughness={0.5} wireframe />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.3, 0.05, 0.9]} />
            <meshStandardMaterial {...GOLD} />
          </mesh>
        </group>
      ))}
      {[-0.28, 0.28].map((x) => (
        <group key={x} position={[x, 0.66, -0.1]}>
          <mesh>
            <boxGeometry args={[0.44, 0.06, 0.45]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
          <mesh position={[0, 0.25, -0.22]}>
            <boxGeometry args={[0.44, 0.5, 0.05]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.9, 0.85]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.35]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, 1.6, 1.1]}>
        <cylinderGeometry args={[0.02, 0.02, 1.3]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, 2.25, 1.1]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.5, 0.25, 16, 1, true]} />
        <meshStandardMaterial color="#e9e9ee" side={THREE.DoubleSide} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  )
}

// Surveyor: cuerpo triangular sobre tres patas, mástil, panel solar y antena.
export function Surveyor() {
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.55, 0.75]} rotation={[0.85, 0, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 1.3]} />
              <meshStandardMaterial {...METAL} />
            </mesh>
            <mesh position={[0, 0.05, 1.25]} castShadow>
              <cylinderGeometry args={[0.2, 0.22, 0.08, 16]} />
              <meshStandardMaterial {...METAL} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.35, 3]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0.2, 1.4, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.3]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.8]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, 3.0, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.1, 0.03, 0.8]} />
        <meshStandardMaterial color="#26355e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* brazo con pala */}
      <mesh position={[-0.6, 1.0, 0.3]} rotation={[0, 0, 0.9]} castShadow>
        <boxGeometry args={[0.06, 0.9, 0.06]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
    </group>
  )
}

// Destello del retrorreflector: un haz alto y pulsos de luz que bajan por él.
// Se ve desde lejos, por encima del horizonte, para despertar la curiosidad.
export function Beacon({ color = '#7cf2ff', height = 60 }) {
  const beam = useRef()
  const pulse = useRef()
  const flash = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const cycle = (t % 2.5) / 2.5
    pulse.current.position.y = height * (1 - cycle)
    const hit = Math.max(0, 1 - Math.abs(cycle - 1) * 12)
    flash.current.scale.setScalar(0.5 + hit * 3)
    flash.current.material.opacity = 0.25 + hit * 0.75
    beam.current.material.opacity = 0.1 + Math.sin(t * 2) * 0.03
  })
  return (
    <group>
      <mesh ref={beam} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.15, 0.35, height, 12, 1, true]} />
        <meshBasicMaterial color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.45, 12, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={flash} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshBasicMaterial color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
