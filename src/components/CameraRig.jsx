import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { latLonToVec3 } from '../lib/geo'

const HOME_DIST = 3.4
const FOCUS_DIST = 1.75

// Vuela la cámara alrededor de la Luna hasta quedar encima del artefacto elegido.
export default function CameraRig({ target }) {
  const { camera } = useThree()
  const controls = useRef()

  useEffect(() => {
    const from = camera.position.clone()
    const fromDir = from.clone().normalize()
    const fromDist = from.length()
    const toDir = target ? latLonToVec3(target.lat, target.lon, 1) : fromDir.clone()
    const toDist = target ? FOCUS_DIST : HOME_DIST
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const state = { t: 0 }
    const dir = new THREE.Vector3()
    const tween = gsap.to(state, {
      t: 1,
      duration: reduce ? 0 : target ? 2.2 : 1.4,
      ease: 'power3.inOut',
      onStart: () => controls.current && (controls.current.enabled = false),
      onUpdate: () => {
        dir.copy(fromDir).lerp(toDir, state.t).normalize()
        // Arco: se aleja un poco a mitad del vuelo para que se vea el giro.
        const lift = Math.sin(state.t * Math.PI) * (target ? 0.6 : 0)
        camera.position.copy(dir).multiplyScalar(THREE.MathUtils.lerp(fromDist, toDist, state.t) + lift)
        camera.lookAt(0, 0, 0)
        controls.current?.update()
      },
      onComplete: () => controls.current && (controls.current.enabled = true),
    })
    return () => tween.kill()
  }, [target, camera])

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={1.35}
      maxDistance={6}
      rotateSpeed={0.5}
      zoomSpeed={0.6}
      autoRotate={!target}
      autoRotateSpeed={0.25}
    />
  )
}
