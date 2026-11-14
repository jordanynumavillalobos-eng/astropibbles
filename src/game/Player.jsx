import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { game } from './store'
import { input } from './input'
import { sfx } from './audio'
import {
  R, WALK, RUN, TURN, G_MOON, JUMP_V, SUN_DIR, INTERACT_RADIUS,
  HOP_SPEED, THRUST, BURN, REFUEL, SAFE_LANDING, LANDER_RADIUS,
} from './constants'
import Pibble from './Pibble'
import Lander from './Lander'

const axis = new THREE.Vector3()
const right = new THREE.Vector3()
const pos = new THREE.Vector3()
const landerPos = new THREE.Vector3()
const camTarget = new THREE.Vector3()
const look = new THREE.Vector3()
const basis = new THREE.Matrix4()

function orient(obj, n, f, height) {
  obj.position.copy(n).multiplyScalar(R + height)
  right.crossVectors(n, f)
  basis.makeBasis(right, n, f)
  obj.quaternion.setFromRotationMatrix(basis)
}

// Caminar sobre una esfera: Pibble es un punto `n` sobre la esfera unidad.
// Avanzar = girar `n` (y su dirección `f`) alrededor del eje n × f.
export default function Player({ sites, paused, onNear, onInteract, onBounce }) {
  const body = useRef()
  const pibble = useRef()
  const parked = useRef()
  const sun = useRef()
  const { camera } = useThree()
  const sitePos = useMemo(() => sites.map((s) => ({ id: s.id, p: s.position })), [sites])

  const cameraGoal = () => {
    const inLander = game.vehicle === 'lander'
    pos.copy(game.n).multiplyScalar(R + game.h)
    camTarget.copy(pos).addScaledVector(game.n, inLander ? 5 : 3.2).addScaledVector(game.f, inLander ? -11 : -6.5)
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
    const inLander = game.vehicle === 'lander'

    if (active && input.turn) game.f.applyAxisAngle(game.n, input.turn * TURN * dt)

    // Velocidad horizontal: a pie, o volando con el saltador (solo en el aire)
    let speed = 0
    if (active) {
      if (!inLander) speed = input.forward * (input.run ? RUN : WALK)
      else if (!game.grounded) speed = input.forward * HOP_SPEED
    }
    game.moving = speed !== 0
    if (speed) {
      axis.crossVectors(game.n, game.f).normalize()
      const angle = (speed * dt) / R
      game.n.applyAxisAngle(axis, angle).normalize()
      game.f.applyAxisAngle(axis, angle)
      game.distance += Math.abs(speed * dt)
      if (game.grounded && !inLander) {
        const before = Math.floor(game.phase / Math.PI)
        game.phase += Math.abs(speed) * dt * 2.4
        if (Math.floor(game.phase / Math.PI) !== before) sfx.step()
      }
    }
    game.f.addScaledVector(game.n, -game.f.dot(game.n)).normalize()

    // Vertical: salto a pie o motor del saltador
    if (inLander) {
      game.thrusting = active && input.thrust && game.fuel > 0
      if (game.thrusting) {
        game.vy += THRUST * dt
        game.fuel = Math.max(0, game.fuel - BURN * dt)
        game.grounded = false
      } else if (game.grounded) {
        game.fuel = Math.min(1, game.fuel + REFUEL * dt)
      }
      sfx.thrust(game.thrusting ? 1 : 0)
      input.jumpQueued = false
    } else {
      if (active && input.jumpQueued && game.grounded) {
        game.vy = JUMP_V
        game.grounded = false
        game.jumpPeak = 0
      }
      input.jumpQueued = false
    }

    if (!game.grounded) {
      game.vy -= G_MOON * dt
      game.h += game.vy * dt
      game.jumpPeak = Math.max(game.jumpPeak, game.h)
      if (game.h <= 0) {
        const impact = -game.vy
        game.h = 0
        game.lastImpact = impact
        if (inLander && impact > SAFE_LANDING) {
          // Demasiado rápido: rebote (como le pasó al Surveyor 3)
          game.vy = impact * 0.35
          game.bounces += 1
          sfx.bounce()
          onBounce?.(impact)
        } else {
          game.vy = 0
          game.grounded = true
          if (!inLander) game.lastJump = game.jumpPeak
          sfx.land(impact)
        }
      }
    }

    // Colocar a Pibble (y el saltador, si va dentro)
    orient(body.current, game.n, game.f, game.h)
    pibble.current.position.y = inLander ? 0.75 : 0
    parked.current.visible = !inLander
    if (!inLander) orient(parked.current, game.landerN, game.landerF, 0)

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
    landerPos.copy(game.landerN).multiplyScalar(R)
    game.nearLander = !inLander && game.grounded && landerPos.distanceTo(pos) < LANDER_RADIUS

    if (input.interactQueued) {
      input.interactQueued = false
      if (!active) return
      if (inLander) {
        if (game.grounded) {
          // Bajar: el saltador queda aparcado aquí y Pibble sale a un lado
          game.vehicle = null
          game.landerN.copy(game.n)
          game.landerF.copy(game.f)
          game.n.applyAxisAngle(game.f, -2.5 / R).normalize()
          game.thrusting = false
          sfx.thrust(0)
          sfx.click()
        }
      } else if (near) {
        onInteract?.(near)
      } else if (game.nearLander) {
        game.vehicle = 'lander'
        game.n.copy(game.landerN)
        game.f.copy(game.landerF)
        sfx.click()
      }
    }
  })

  return (
    <>
      <group ref={body}>
        <group ref={pibble}>
          <Pibble />
        </group>
        {/* saltador cuando Pibble va dentro */}
        <LanderWhenActive />
      </group>
      <group ref={parked}>
        <Lander active={false} />
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

function LanderWhenActive() {
  const g = useRef()
  useFrame(() => {
    g.current.visible = game.vehicle === 'lander'
  })
  return (
    <group ref={g}>
      <Lander active />
    </group>
  )
}
