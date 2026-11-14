// Bitácora de Pibble: una red de pistas.
// - Un "rumor" es una pregunta o pista que apunta a un sitio (`target`).
// - Una "máquina" se marca al encontrarla y, al leer su historia, desbloquea nuevos rumores.
// Los rumores solo usan hechos ya verificados en `artifacts.js` (fuentes de NASA).
// `pos` es la posición de la tarjeta en el tablero, en % (x, y).

export const logEntries = [
  {
    id: 'r-destello',
    kind: 'rumor',
    title: 'Un destello',
    text: 'Desde que aterricé veo una luz que va y viene, cerca de donde se posó el Apolo 11, en el Mar de la Tranquilidad. ¿Qué la provoca?',
    target: 'lrrr-apollo11',
    unlockedBy: null,
    pos: [10, 22],
  },
  { id: 'lrrr-apollo11', kind: 'artifact', pos: [32, 22] },
  {
    id: 'r-hermano',
    kind: 'rumor',
    title: 'Un hermano en Hadley',
    text: 'El Espejo dice que no está solo: el Apolo 15 dejó otro retrorreflector en Hadley-Apeninos, mucho más al norte. ¿Qué más habrá allí?',
    target: 'lrv-apollo15',
    unlockedBy: 'lrrr-apollo11',
    pos: [54, 22],
  },
  { id: 'lrv-apollo15', kind: 'artifact', pos: [76, 22] },
  {
    id: 'r-suelo',
    kind: 'rumor',
    title: '¿Quién probó el suelo?',
    text: 'Antes de que llegaran personas, alguien tuvo que comprobar si el suelo aguantaría el peso de una nave. Algo me dice que la respuesta está al oeste, en el Océano de las Tormentas.',
    target: 'surveyor3',
    unlockedBy: 'lrv-apollo15',
    pos: [76, 66],
  },
  { id: 'surveyor3', kind: 'artifact', pos: [54, 66] },
  {
    id: 'r-marte',
    kind: 'teaser',
    title: '¿Y en Marte?',
    text: 'La Luna no es el único mundo donde esperan máquinas de NASA. Próxima misión: Marte.',
    unlockedBy: 'surveyor3',
    pos: [32, 66],
  },
]

// Hallazgo extra: no lo señala ninguna pista con palabras; hay que encontrarlo con el receptor (Q).
logEntries.push({
  id: 'bonus-apollo14',
  kind: 'bonus',
  title: 'El tercer espejo',
  text: 'Con el receptor capté un eco en Fra Mauro: es el retrorreflector del Apolo 14. ¡Ya conozco a toda la familia de El Espejo!',
  hintedBy: 'lrrr-apollo11',
  pos: [10, 66],
})

// Conexiones del tablero: rumor → máquina que señala; máquina → rumores que desbloquea.
export const logLinks = logEntries.flatMap((e) => {
  const links = []
  if (e.kind === 'rumor') links.push([e.id, e.target])
  if (e.unlockedBy) links.push([e.unlockedBy, e.id])
  if (e.hintedBy) links.push([e.hintedBy, e.id])
  return links
})

// Lo que dice Pibble la primera vez que llega a cada máquina.
export const discoveryLines = {
  'lrrr-apollo11': '¡Era esto lo que brillaba! Una placa llena de cubos que devuelve la luz.',
  'lrv-apollo15': '¡Un coche! Con ruedas de malla de acero… y un retrorreflector cerca.',
  surveyor3: 'Una nave de tres patas, sola en el Océano de las Tormentas.',
  'bonus-apollo14': '¡El eco venía de aquí! Otro retrorreflector, el del Apolo 14, en Fra Mauro.',
}
