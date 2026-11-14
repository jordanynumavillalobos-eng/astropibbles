import * as THREE from 'three'

// Datos físicos: NSSDCA Moon Fact Sheet
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
export const MOON_RADIUS_KM = 1737.4 // radio medio volumétrico
export const G_MOON = 1.62 // gravedad superficial (m/s²)
export const G_EARTH = 9.8 // gravedad superficial de la Tierra (m/s²), misma tabla

// Escala del juego: una "Luna de juguete". 1 unidad = 1 metro para Pibble,
// pero la Luna mide solo R unidades de radio para que se pueda recorrer en minutos.
// Las distancias que se muestran al jugador se convierten a km reales.
export const R = 120
export const unitsToRealKm = (units) => (units / R) * MOON_RADIUS_KM

// Movimiento
export const WALK = 4.5
export const RUN = 9
export const TURN = 2.2 // rad/s
// Mismo impulso con el que Pibble saltaría 0,5 m en la Tierra.
export const EARTH_JUMP_M = 0.5
export const JUMP_V = Math.sqrt(2 * G_EARTH * EARTH_JUMP_M)

export const INTERACT_RADIUS = 7

// El Sol ilumina la cara visible (donde están los sitios Apolo y Surveyor).
export const SUN_DIR = new THREE.Vector3(1, 0.45, 0.25).normalize()
