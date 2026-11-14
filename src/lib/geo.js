import * as THREE from 'three'

// Convierte latitud/longitud (grados) a un punto sobre una esfera de Three.js.
// Coincide con las UV de THREE.SphereGeometry y un mapa equirectangular
// cuyo borde izquierdo es la longitud -180°: lon 0° → +X, lon -90° → +Z.
export function latLonToVec3(lat, lon, radius = 1) {
  const la = THREE.MathUtils.degToRad(lat)
  const lo = THREE.MathUtils.degToRad(lon)
  return new THREE.Vector3(
    radius * Math.cos(la) * Math.cos(lo),
    radius * Math.sin(la),
    -radius * Math.cos(la) * Math.sin(lo),
  )
}
