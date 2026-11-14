// Artefactos que NASA dejó en la Luna.
// REGLA DEL PROYECTO: cada dato debe venir de una página oficial de NASA
// (NSSDCA, nasa.gov, science.nasa.gov, trek.nasa.gov) listada en `sources`.
// Verificado contra NSSDCA el 2026-11-14.
// Coordenadas: latitud (+N / -S), longitud (+E / -O).

const NSSDC = 'https://nssdc.gsfc.nasa.gov'

export const artifacts = [
  {
    id: 'lrrr-apollo11',
    name: 'Retrorreflector del Apolo 11',
    nickname: 'El Espejo',
    body: 'moon',
    mission: 'Apolo 11',
    year: 1969,
    // NSSDC lunar_sites.html: LRRR 0.67345 N, 23.47307 E
    lat: 0.67345,
    lon: 23.47307,
    status: 'active',
    statusLabel: 'Aún responde a los láseres',
    color: '#7cf2ff',
    tagline: 'No tengo motores ni baterías. Solo devuelvo la luz.',
    chapters: [
      {
        title: '¿Quién soy?',
        text: 'Soy una matriz de retrorreflectores: una placa llena de cubos de sílice fundida. Mi truco es sencillo: cualquier rayo de luz que me llega, lo devuelvo hacia el mismo lugar del que salió. Peso 77 kg y no necesito electricidad para trabajar.',
      },
      {
        title: 'Mi viaje',
        text: 'Viajé dentro del módulo lunar Eagle, que aterrizó el 20 de julio de 1969 en el Mar de la Tranquilidad. La tripulación del Apolo 11 me dejó instalado en la superficie, a pocos metros de su nave.',
      },
      {
        title: 'Lo que hago',
        text: 'Desde estaciones en la Tierra, como la estación láser del Observatorio McDonald en Texas, disparan pulsos de láser hacia mí. Yo los devuelvo y ellos miden cuánto tarda la luz en ir y volver. Como la velocidad de la luz es conocida, ese tiempo dice a qué distancia exacta está la Luna.',
      },
      {
        title: 'Mi familia',
        text: 'No estoy solo: el Apolo 14 dejó otro retrorreflector en la región de Fra Mauro y el Apolo 15 dejó otro en Hadley-Apeninos. Juntos formamos un triángulo de espejos sobre la cara visible de la Luna.',
      },
    ],
    myth: {
      claim: '"Todo lo que dejaron los astronautas en la Luna necesita energía para funcionar."',
      truth: 'Falso. Un retrorreflector es pasivo: no tiene baterías ni electrónica. Por eso NASA todavía publica enlaces a los conjuntos de datos actuales de Lunar Laser Ranging que lo usan.',
    },
    sources: [
      { label: 'NSSDCA – Laser Ranging Retro-Reflector (Apollo 11)', url: `${NSSDC}/nmc/experiment/display.action?id=1969-059C-04` },
      { label: 'NSSDCA – Apollo 11 Lunar Module', url: `${NSSDC}/nmc/spacecraft/display.action?id=1969-059C` },
      { label: 'NSSDCA – Coordenadas de los sitios lunares', url: `${NSSDC}/planetary/lunar/lunar_sites.html` },
    ],
  },
  {
    id: 'lrv-apollo15',
    name: 'Rover Lunar del Apolo 15',
    nickname: 'El Explorador',
    body: 'moon',
    mission: 'Apolo 15',
    year: 1971,
    // NSSDC Apollo 15 LM: 26.13239 N, 3.63330 E
    lat: 26.13239,
    lon: 3.6333,
    status: 'silent',
    statusLabel: 'Aparcado desde 1971',
    color: '#ffb86b',
    tagline: 'Fui el primer coche que rodó por la Luna.',
    chapters: [
      {
        title: '¿Quién soy?',
        text: 'Soy el Lunar Roving Vehicle, un coche eléctrico de cuatro ruedas. Tengo una masa de 210 kg, pero puedo cargar 490 kg más: dos astronautas, herramientas y rocas. Mis ruedas no llevan aire: están hechas de hilos de acero tejidos y recubiertos de zinc.',
      },
      {
        title: 'Mi viaje',
        text: 'Viajé plegado dentro del módulo lunar Falcon, que aterrizó el 30 de julio de 1971 en la región de Hadley-Apeninos, junto a montañas enormes y un cañón llamado Hadley Rille.',
      },
      {
        title: 'Lo que hice',
        text: 'Con los astronautas Dave Scott y Jim Irwin recorrí 27,8 km, mucho más lejos de lo que podían ir caminando con sus trajes. En la segunda excursión visitamos cráteres como Index, Crescent, Dune y Spur para recoger muestras de roca.',
      },
      {
        title: 'Mi final',
        text: 'Me movían dos baterías de 36 voltios de plata y zinc que no se podían recargar. Al terminar la misión, los astronautas volvieron a casa y yo me quedé en Hadley-Apeninos, donde sigo aparcado.',
      },
    ],
    myth: {
      claim: '"El rover lunar se recargaba con paneles solares."',
      truth: 'Falso. NSSDCA indica que usaba dos baterías de plata-zinc de 36 V no recargables. Por eso solo podía funcionar durante la misión.',
    },
    sources: [
      { label: 'NSSDCA – Lunar Roving Vehicle', url: `${NSSDC}/planetary/lunar/apollo_lrv.html` },
      { label: 'NSSDCA – Apollo 15 Lunar Module "Falcon"', url: `${NSSDC}/nmc/spacecraft/display.action?id=1971-063C` },
    ],
  },
  {
    id: 'surveyor3',
    name: 'Surveyor 3',
    nickname: 'El Pionero',
    body: 'moon',
    mission: 'Surveyor 3',
    year: 1967,
    // NSSDC: 3.0162 S, 336.582 E  (= 23.418 O)
    lat: -3.0162,
    lon: -23.418,
    status: 'silent',
    statusLabel: 'En silencio (recibió visitas)',
    color: '#c9a2ff',
    tagline: 'Llegué antes que los humanos… y luego ellos vinieron a visitarme.',
    chapters: [
      {
        title: '¿Quién soy?',
        text: 'Soy una nave robótica de tres patas, con una cámara de televisión y un brazo con una pala para tomar muestras. Mi misión: averiguar si el suelo lunar era lo bastante firme para que aterrizaran naves con personas.',
      },
      {
        title: 'Mi viaje',
        text: 'Despegué el 17 de abril de 1967 y llegué a la Luna el 20 de abril, al sureste del Océano de las Tormentas. Mi aterrizaje fue movidito: mis motores no se apagaron a tiempo, toqué el suelo tres veces y rebotué dos. Desde la Tierra tuvieron que enviarme la orden de apagarlos.',
      },
      {
        title: 'Lo que descubrí',
        text: 'Durante 18 horas y 22 minutos usé mi pala para cavar zanjas de hasta 18 cm de profundidad y comprobar la resistencia del suelo. Mi cámara envió 6.326 fotografías a la Tierra.',
      },
      {
        title: 'La visita',
        text: 'El 19 de noviembre de 1969, el Apolo 12 aterrizó a unos 180 m de mí. Los astronautas Pete Conrad y Alan Bean caminaron hasta donde yo estaba y se llevaron unos 10 kg de piezas, incluida mi cámara de TV, para estudiarlas en la Tierra.',
      },
    ],
    myth: {
      claim: '"Surveyor 3 aterrizó suavemente a la primera."',
      truth: 'Falso. Según NSSDCA, tocó la superficie tres veces porque sus motores no se apagaron. Los puntos de contacto quedaron a unos 20 m y 11 m de distancia entre sí.',
    },
    sources: [
      { label: 'NSSDCA – Surveyor 3', url: `${NSSDC}/nmc/spacecraft/display.action?id=1967-035A` },
      { label: 'NSSDCA – Apollo 12', url: `${NSSDC}/planetary/lunar/apollo12info.html` },
    ],
  },
]

// Mosaico global LRO WAC de NASA Moon Trek (WMTS, equirectangular).
// Capabilities: https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/WMTSCapabilities.xml
// Nivel z: (2·2^z) columnas × (2^z) filas de teselas de 256 px.
export const MOON_TREK_TILE = (z, row, col) =>
  `https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0//default/default028mm/${z}/${row}/${col}.jpg`

// Retrorreflectores: fuentes de "eco" para el receptor de señales de Pibble.
// Coordenadas: NSSDCA lunar_sites.html (https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html)
export const reflectors = [
  { id: 'lrrr-apollo11', lat: 0.67345, lon: 23.47307 },
  { id: 'lrrr-apollo15', lat: 26.13341, lon: 3.6285 },
  { id: 'bonus-apollo14', lat: -3.64417, lon: -17.47865 },
]

// Hallazgo extra (sin historia completa): el retrorreflector del Apolo 14 en Fra Mauro.
export const bonusSites = [
  {
    id: 'bonus-apollo14',
    name: 'Retrorreflector del Apolo 14',
    nickname: 'El tercer espejo',
    lat: -3.64417,
    lon: -17.47865,
    color: '#7cf2ff',
    source: { label: 'NSSDCA – Coordenadas de los sitios lunares', url: `${NSSDC}/planetary/lunar/lunar_sites.html` },
  },
]
