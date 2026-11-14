import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { game } from './store'
import { input } from './input'
import { R, WALK, RUN, TURN, G_MOON, JUMP_V, SUN_DIR, INTERACT_RADIUS } from './constants'
import Pibble from './Pibble'

const axis = new THREE.Vector3()
const right = new THREE.Vector3()
const pos = new THREE.Vector3()
const camTarget = new THREE.Vector3()
const look = new THREE.Vector3()
const basis = new THREE.Matrix4()

const CAM_BACK = 6.5
const CAM_UP = 3.2

// Caminar sobre una esfera: Pibble es un punto `n` sobre la esfera unidad.
// Avanzar = girar `n` (y su dirección `f`) alrededor del eje n × f.
export default function Player({ sites, paused, onNear, onInteract }) {
  const body = useRef()
  const sun = useRef()
  const { camera } = useThree()
  const sitePos = useMemo(() => sites.map((s) => ({ id: s.id, p: s.position })), [sites])

  const cameraGoal = () => {
    pos.copy(game.n).multiplyScalar(R + game.h)
    camTarget.copy(pos).addScaledVector(game.n, CAM_UP).addScaledVector(game.f, -CAM_BACK)
    look.copy(pos).addScaledVector(game.n, 1).addScaledVector(game.f, 3)
  }

  useLayoutEffect(() => {
    cameraGoal()
    camera.position.copy(camTarget)
    camera.up.copy(game.n)
    camera.lookAt(look)
  }, [camera])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const active = !paused

    // Girar
    if (active && input.turn) game.f.applyAxisAngle(game.n, input.turn * TURN * dt)

    // Avanzar sobre la superficie
    const speed = active ? input.forward * (input.run ? RUN : WALK) : 0
    game.moving = speed !== 0
    if (speed) {
      axis.crossVectors(game.n, game.f).normalize()
      const angle = (speed * dt) / R
      game.n.applyAxisAngle(axis, angle).normalize()
      game.f.applyAxisAngle(axis, angle)
      game.distance += Math.abs(speed * dt)
      if (game.grounded) game.phase += Math.abs(speed) * dt * 2.4
    }
    game.f.addScaledVector(game.n, -game.f.dot(game.n)).normalize()

    // Saltar con gravedad lunar
    if (active && input.jumpQueued && game.grounded) {
      game.vy = JUMP_V
      game.grounded = false
      game.jumpPeak = 0
    }
    input.jumpQueued = false
    if (!game.grounded) {
      game.vy -= G_MOON * dt
      game.h += game.vy * dt
      game.jumpPeak = Math.max(game.jumpPeak, game.h)
      if (game.h <= 0) {
        game.h = 0
        game.vy = 0
        game.grounded = true
        game.lastJump = game.jumpPeak
      }
    }

    // Colocar a Pibble: arriba = n, adelante = f
    pos.copy(game.n).multiplyScalar(R + game.h)
    right.crossVectors(game.n, game.f)
    basis.makeBasis(right, game.n, game.f)
    body.current.position.copy(pos)
    body.current.quaternion.setFromRotationMatrix(basis)

    // Cámara en tercera persona, suavizada
    cameraGoal()
    const k = 1 - Math.exp(-4 * dt)
    camera.position.lerp(camTarget, k)
    camera.up.lerp(game.n, k).normalize()
    camera.lookAt(look)

    // La luz del Sol sigue a Pibble para que su sombra siempre se vea
    sun.current.position.copy(pos).addScaledVector(SUN_DIR, 60)
    sun.current.target.position.copy(pos)
    sun.current.target.updateMatrixWorld()

    // ¿Hay algo cerca?
    let near = null
    for (const s of sitePos) if (s.p.distanceTo(pos) < INTERACT_RADIUS) near = s.id
    if (near !== game.nearId) {
      game.nearId = near
      onNear?.(near)
    }
    if (input.interactQueued) {
      input.interactQueued = false
      if (near && active) onInteract?.(near)
    }
  })

  return (
    <>
      <group ref={body}>
        <Pibble />
      </group>
      <directionalLight
        ref={sun}
        castShadow
        intensity={2.8}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0005}
      />
    </>
  )
}
