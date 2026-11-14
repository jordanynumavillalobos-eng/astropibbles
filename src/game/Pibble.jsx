import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { game } from './store'

// Pibble astronauta, hecho con formas básicas (mira hacia +Z, patas en y = 0).
// Se puede cambiar por un modelo .glb cuando el equipo lo tenga.
const FUR = '#9aa3b5'
const CREAM = '#f3eee6'
const DARK = '#2a2d36'
const PINK = '#e8a3a8'
const SUIT = '#f7f7f9'
const ORANGE = '#ff8a3d'

function Leg({ legRef, x, z }) {
  return (
    <group ref={legRef} position={[x, 0.42, z]}>
      <mesh position={[0, -0.2, 0]} castShadow>
        <capsuleGeometry args={[0.075, 0.26, 4, 8]} />
        <meshStandardMaterial color={FUR} roughness={0.8} />
      </mesh>
      {/* bota del traje */}
      <mesh position={[0, -0.36, 0.02]} castShadow>
        <sphereGeometry args={[0.09, 12, 8]} />
        <meshStandardMaterial color={SUIT} roughness={0.5} />
      </mesh>
    </group>
  )
}

export default function Pibble() {
  const root = useRef()
  const head = useRef()
  const tail = useRef()
  const fl = useRef()
  const fr = useRef()
  const bl = useRef()
  const br = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const walking = game.moving && game.grounded
    const swing = walking ? Math.sin(game.phase) * 0.7 : 0
    if (game.grounded) {
      fl.current.rotation.x = swing
      br.current.rotation.x = swing
      fr.current.rotation.x = -swing
      bl.current.rotation.x = -swing
    } else {
      // En el aire: patas estiradas, como "nadando" en la gravedad lunar
      fl.current.rotation.x = fr.current.rotation.x = -0.6
      bl.current.rotation.x = br.current.rotation.x = 0.6
    }
    root.current.position.y = walking ? Math.abs(Math.sin(game.phase)) * 0.06 : 0
    tail.current.rotation.z = Math.sin(t * (walking ? 14 : 7)) * 0.5
    head.current.rotation.y = walking ? 0 : Math.sin(t * 0.7) * 0.25
  })

  return (
    <group ref={root}>
      {/* cuerpo */}
      <mesh position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.5, 6, 16]} />
        <meshStandardMaterial color={FUR} roughness={0.8} />
      </mesh>
      {/* pecho */}
      <mesh position={[0, 0.5, 0.3]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color={CREAM} roughness={0.9} />
      </mesh>
      {/* mochila de oxígeno */}
      <mesh position={[0, 0.88, -0.08]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.44]} />
        <meshStandardMaterial color={SUIT} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.98, -0.08]}>
        <boxGeometry args={[0.1, 0.05, 0.2]} />
        <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.6} />
      </mesh>

      <Leg legRef={fl} x={0.15} z={0.3} />
      <Leg legRef={fr} x={-0.15} z={0.3} />
      <Leg legRef={bl} x={0.15} z={-0.3} />
      <Leg legRef={br} x={-0.15} z={-0.3} />

      {/* cola */}
      <group ref={tail} position={[0, 0.66, -0.5]} rotation={[-0.9, 0, 0]}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <capsuleGeometry args={[0.035, 0.22, 4, 8]} />
          <meshStandardMaterial color={FUR} />
        </mesh>
      </group>

      {/* cabeza */}
      <group ref={head} position={[0, 0.92, 0.45]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 20, 16]} />
          <meshStandardMaterial color={FUR} roughness={0.8} />
        </mesh>
        {/* hocico ancho, típico de un pibble */}
        <mesh position={[0, -0.06, 0.2]} scale={[1.25, 0.8, 1]} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.01, 0.32]}>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial color={DARK} roughness={0.3} />
        </mesh>
        {/* sonrisa */}
        <mesh position={[0, -0.12, 0.3]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.05, 0.01, 6, 16, Math.PI]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
        {/* ojos */}
        {[-1, 1].map((s) => (
          <group key={s} position={[0.1 * s, 0.07, 0.2]}>
            <mesh>
              <sphereGeometry args={[0.042, 12, 10]} />
              <meshStandardMaterial color={DARK} roughness={0.2} />
            </mesh>
            <mesh position={[0.012 * s, 0.015, 0.03]}>
              <sphereGeometry args={[0.012, 8, 6]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
        ))}
        {/* orejas dobladas hacia delante, como las de un pibble */}
        {[-1, 1].map((s) => (
          <group key={s} position={[0.17 * s, 0.17, 0.02]} rotation={[0.9, 0, -0.7 * s]}>
            <mesh position={[0, 0.06, 0]} scale={[1, 1, 0.35]} castShadow>
              <sphereGeometry args={[0.085, 12, 10]} />
              <meshStandardMaterial color={FUR} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.06, 0.025]} scale={[0.7, 0.7, 0.2]}>
              <sphereGeometry args={[0.085, 12, 10]} />
              <meshStandardMaterial color={PINK} roughness={0.8} />
            </mesh>
          </group>
        ))}
        {/* casco */}
        <mesh>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshStandardMaterial color="#cfefff" transparent opacity={0.16} roughness={0.05} metalness={0.2} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2 - 0.25, 0, 0]} position={[0, -0.22, -0.05]}>
          <torusGeometry args={[0.33, 0.04, 8, 32]} />
          <meshStandardMaterial color={SUIT} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}
