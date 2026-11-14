import * as THREE from 'three'
import { latLonToVec3 } from '../lib/geo'

// Estado mutable del jugador. Se actualiza en cada frame (fuera de React)
// y la interfaz lo lee varias veces por segundo.
export const game = {
  n: new THREE.Vector3(1, 0, 0), // dirección "arriba" (posición sobre la esfera unidad)
  f: new THREE.Vector3(0, 1, 0), // hacia dónde mira Pibble (tangente)
  h: 0, // altura sobre el suelo
  vy: 0,
  grounded: true,
  moving: false,
  phase: 0, // fase de la animación de caminar
  distance: 0, // unidades recorridas
  jumpPeak: 0,
  lastJump: 0,
  nearId: null,
  // Saltador lunar
  vehicle: null, // null | 'lander'
  landerN: new THREE.Vector3(1, 0, 0),
  landerF: new THREE.Vector3(0, 1, 0),
  nearLander: false,
  fuel: 1,
  thrusting: false,
  bounces: 0,
  lastImpact: 0,
}

// Coloca a Pibble en (lat, lon) mirando hacia (lookLat, lookLon), girado `offset` rad.
export function spawn(lat, lon, lookLat, lookLon, offset = 0) {
  game.n.copy(latLonToVec3(lat, lon, 1))
  const target = latLonToVec3(lookLat, lookLon, 1)
  game.f.copy(target).addScaledVector(game.n, -target.dot(game.n)).normalize()
  game.f.applyAxisAngle(game.n, offset)
  Object.assign(game, { h: 0, vy: 0, grounded: true, distance: 0, lastJump: 0, nearId: null, vehicle: null, fuel: 1 })
  // El saltador en el que llegó Pibble queda aparcado a su derecha.
  game.landerN.copy(game.n).applyAxisAngle(game.f, -4 / 120).normalize()
  game.landerF.copy(game.f)
}

export function latLonOf(n) {
  return {
    lat: THREE.MathUtils.radToDeg(Math.asin(n.y)),
    lon: THREE.MathUtils.radToDeg(Math.atan2(-n.z, n.x)),
  }
}
