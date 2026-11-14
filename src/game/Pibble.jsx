import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { game } from './store'

// Pibble: bulldog francés astronauta, estilo chibi (cabeza grande, cuerpo pequeño).
// Hecho con formas básicas; mira hacia +Z, con los pies en y = 0.
// Los parches del traje son genéricos (sin insignias reales).
const FUR = '#e6c59b'
const FUR_DARK = '#c99f72'
const EAR_PINK = '#f2a39c'
const NOSE = '#2a2223'
const MOUTH = '#5b2026'
const TONGUE = '#ee7a86'
const SUIT = '#f3f3f0'
const SUIT_SHADE = '#d9dce2'
const BLUE = '#3c6fd6'
const GLOVE = '#b9bfc8'
const SOLE = '#4a4f58'

const fur = { color: FUR, roughness: 0.85 }

// Perfil de la oreja (se gira alrededor del eje Y y luego se aplana).
const EAR_PROFILE = [
  [0.001, 0], [0.14, 0], [0.145, 0.08], [0.13, 0.16], [0.1, 0.24], [0.065, 0.3], [0.035, 0.335], [0.001, 0.35],
].map(([x, y]) => new THREE.Vector2(x, y))
const suit = { color: SUIT, roughness: 0.55 }

function Eye({ x }) {
  const s = Math.sign(x)
  return (
    <group position={[x, 0.05, 0.25]}>
      <mesh>
        <sphereGeometry args={[0.068, 24, 18]} />
        <meshStandardMaterial color="#24150e" roughness={0.12} metalness={0.1} />
      </mesh>
      {/* brillos que dan la mirada tierna */}
      <mesh position={[0.02 * s, 0.026, 0.058]}>
        <sphereGeometry args={[0.014, 10, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[-0.018 * s, -0.02, 0.064]}>
        <sphereGeometry args={[0.008, 8, 6]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  )
}

function Ear({ side }) {
  return (
    <group position={[0.19 * side, 0.18, -0.03]} rotation={[0, 0.3 * side, -0.32 * side]}>
      {/* oreja de murciélago: erguida, base ancha y punta redondeada */}
      <mesh position={[0, -0.01, 0]} scale={[1, 1, 0.32]} castShadow>
        <latheGeometry args={[EAR_PROFILE, 28]} />
        <meshStandardMaterial {...fur} />
      </mesh>
      <mesh position={[0, 0.01, 0.03]} scale={[0.74, 0.82, 0.12]}>
        <latheGeometry args={[EAR_PROFILE, 28]} />
        <meshStandardMaterial color={EAR_PINK} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Arm({ armRef, side }) {
  return (
    <group ref={armRef} position={[0.25 * side, 0.78, 0]}>
      <mesh position={[0, -0.14, 0]} castShadow>
        <capsuleGeometry args={[0.075, 0.16, 6, 12]} />
        <meshStandardMaterial {...suit} />
      </mesh>
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.014, 8, 20]} />
        <meshStandardMaterial color={BLUE} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.31, 0.01]} castShadow>
        <sphereGeometry args={[0.08, 14, 12]} />
        <meshStandardMaterial color={GLOVE} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Leg({ legRef, side }) {
  return (
    <group ref={legRef} position={[0.1 * side, 0.36, 0]}>
      <mesh position={[0, -0.1, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.08, 6, 12]} />
        <meshStandardMaterial {...suit} />
      </mesh>
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.014, 8, 20]} />
        <meshStandardMaterial color={BLUE} roughness={0.5} />
      </mesh>
      {/* bota blanca con suela oscura */}
      <mesh position={[0, -0.26, 0.03]} castShadow>
        <boxGeometry args={[0.17, 0.12, 0.24]} />
        <meshStandardMaterial {...suit} />
      </mesh>
      <mesh position={[0, -0.33, 0.035]}>
        <boxGeometry args={[0.18, 0.04, 0.26]} />
        <meshStandardMaterial color={SOLE} roughness={0.8} />
      </mesh>
    </group>
  )
}

export default function Pibble() {
  const root = useRef()
  const head = useRef()
  const armL = useRef()
  const armR = useRef()
  const legL = useRef()
  const legR = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const walking = game.moving && game.grounded && game.vehicle !== 'lander'
    const swing = walking ? Math.sin(game.phase) : 0

    if (!game.grounded && game.vehicle !== 'lander') {
      // En el aire: brazos arriba de alegría y piernas encogidas
      armL.current.rotation.set(0, 0, 2.3 + Math.sin(t * 6) * 0.1)
      armR.current.rotation.set(0, 0, -2.3 - Math.sin(t * 6) * 0.1)
      legL.current.rotation.x = 0.5
      legR.current.rotation.x = -0.3
    } else {
      legL.current.rotation.x = swing * 0.7
      legR.current.rotation.x = -swing * 0.7
      armL.current.rotation.set(-swing * 0.6, 0, 0.12)
      if (!walking && game.nearId) {
        // Saluda al llegar a algo interesante
        armR.current.rotation.set(0, 0, -2.6 + Math.sin(t * 9) * 0.35)
      } else {
        armR.current.rotation.set(swing * 0.6, 0, -0.12 - (walking ? 0 : Math.sin(t * 1.5) * 0.04))
      }
    }

    root.current.position.y = walking ? Math.abs(Math.sin(game.phase)) * 0.05 : Math.sin(t * 2) * 0.008
    root.current.rotation.z = walking ? Math.sin(game.phase) * 0.04 : 0
    head.current.rotation.z = walking ? 0 : Math.sin(t * 0.8) * 0.08
    head.current.rotation.y = walking ? 0 : Math.sin(t * 0.5) * 0.2
  })

  return (
    <group ref={root}>
      {/* --- traje --- */}
      <mesh position={[0, 0.6, 0]} scale={[1.05, 1, 0.9]} castShadow>
        <capsuleGeometry args={[0.21, 0.12, 8, 16]} />
        <meshStandardMaterial {...suit} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 0.9, 1]}>
        <torusGeometry args={[0.205, 0.02, 8, 28]} />
        <meshStandardMaterial color={BLUE} roughness={0.5} />
      </mesh>
      {/* caja de control en el pecho, con luz */}
      <mesh position={[0, 0.66, 0.18]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.05]} />
        <meshStandardMaterial color={SUIT_SHADE} roughness={0.5} />
      </mesh>
      <mesh position={[-0.04, 0.67, 0.206]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
        <meshStandardMaterial color={BLUE} roughness={0.4} />
      </mesh>
      <mesh position={[0.05, 0.67, 0.206]}>
        <boxGeometry args={[0.05, 0.05, 0.01]} />
        <meshStandardMaterial color="#1d2a4a" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.715, 0.205]}>
        <boxGeometry args={[0.07, 0.012, 0.01]} />
        <meshStandardMaterial color="#ffb347" emissive="#ffb347" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.17, 0.58, 0.13]} rotation={[0, 0.7, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.01]} />
        <meshStandardMaterial color="#7fd3ff" emissive="#7fd3ff" emissiveIntensity={1.5} />
      </mesh>
      {/* parche azul genérico en la pierna */}
      <mesh position={[0.1, 0.38, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
        <meshStandardMaterial color={BLUE} roughness={0.4} />
      </mesh>
      {/* mochila */}
      <mesh position={[0, 0.64, -0.22]} castShadow>
        <boxGeometry args={[0.34, 0.4, 0.16]} />
        <meshStandardMaterial color={SUIT_SHADE} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.17 * s, 0.64, -0.22]}>
          <boxGeometry args={[0.012, 0.36, 0.14]} />
          <meshStandardMaterial color={BLUE} />
        </mesh>
      ))}
      {/* anillo del cuello */}
      <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.18, 0.05, 10, 32]} />
        <meshStandardMaterial color={SUIT_SHADE} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.83, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.018, 8, 32]} />
        <meshStandardMaterial color={BLUE} roughness={0.4} />
      </mesh>

      <Arm armRef={armL} side={1} />
      <Arm armRef={armR} side={-1} />
      <Leg legRef={legL} side={1} />
      <Leg legRef={legR} side={-1} />

      {/* --- cabeza de bulldog francés --- */}
      <group ref={head} position={[0, 1.06, 0.02]}>
        <mesh scale={[1.18, 0.93, 0.95]} castShadow>
          <sphereGeometry args={[0.3, 32, 24]} />
          <meshStandardMaterial {...fur} />
        </mesh>
        {/* hocico chato y ancho */}
        <mesh position={[0, -0.07, 0.235]} scale={[1.3, 0.85, 0.65]} castShadow>
          <sphereGeometry args={[0.14, 24, 18]} />
          <meshStandardMaterial {...fur} />
        </mesh>
        {/* boca abierta con lengua: sonrisa ancha */}
        <mesh position={[0, -0.135, 0.27]} scale={[1.55, 0.8, 0.6]}>
          <sphereGeometry args={[0.09, 20, 14]} />
          <meshStandardMaterial color={MOUTH} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.17, 0.31]} scale={[1.25, 0.55, 0.8]}>
          <sphereGeometry args={[0.055, 16, 12]} />
          <meshStandardMaterial color={TONGUE} roughness={0.6} />
        </mesh>
        {/* belfos: la "W" del labio superior, con borde oscuro */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[0.06 * s, -0.075, 0.31]} scale={[1.05, 0.8, 0.75]}>
              <sphereGeometry args={[0.066, 16, 12]} />
              <meshStandardMaterial {...fur} />
            </mesh>
            <mesh position={[0.06 * s, -0.115, 0.318]} rotation={[0.2, 0, 0]} scale={[1, 1, 0.5]}>
              <torusGeometry args={[0.05, 0.007, 6, 14, Math.PI]} />
              <meshStandardMaterial color={NOSE} roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* nariz ancha */}
        <mesh position={[0, -0.02, 0.35]} scale={[1.7, 0.95, 0.85]}>
          <sphereGeometry args={[0.032, 16, 12]} />
          <meshStandardMaterial color={NOSE} roughness={0.3} />
        </mesh>
        {/* arruguita sobre la nariz */}
        <mesh position={[0, 0.035, 0.315]} rotation={[-0.5, 0, 0]}>
          <torusGeometry args={[0.035, 0.005, 6, 14, Math.PI]} />
          <meshStandardMaterial color={FUR_DARK} roughness={0.9} />
        </mesh>
        <Eye x={0.12} />
        <Eye x={-0.12} />
        <Ear side={1} />
        <Ear side={-1} />
      </group>
    </group>
  )
}
