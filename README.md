# Abandonados, no olvidados

NASA Space Apps 2026: *Abandoned but not Forgotten*. Las máquinas que NASA dejó en la Luna cuentan su propia historia, en primera persona.

## MVP

- Globo 3D de la Luna con las teselas oficiales de **NASA Moon Trek** (mosaico LRO WAC).
- "Fantasmas" en las coordenadas reales (NSSDCA) de 3 artefactos: el retrorreflector del Apolo 11, el rover lunar del Apolo 15 y el Surveyor 3.
- Historia por capítulos con animaciones al hacer scroll, sección "¿Mito o realidad?", lectura en voz alta y fuentes de NASA en cada ficha.

## Modo exploración

Pibble, con su traje de astronauta, camina por una "Luna de juguete" de 120 m de radio que usa las texturas reales de Moon Trek. Los sitios están en sus coordenadas reales y el contador convierte lo recorrido a km lunares reales.

- `WASD` o flechas para moverse, `Shift` para correr, `Espacio` para saltar, `E` para examinar y `M` para el mapa.
- El salto usa la gravedad lunar de NSSDCA (1,62 m/s²): con el mismo impulso que en la Tierra daría 0,5 m, en la Luna sube unos 3 m.
- El destello del retrorreflector del Apolo 11 se ve desde lejos para despertar la curiosidad.
- La **bitácora** (`B`) une las pistas: cada historia leída desbloquea la siguiente, y la brújula guía hasta ella. Las pistas están en [`src/data/log.js`](src/data/log.js) y solo usan datos verificados.
- El progreso se guarda en el navegador. Al leer las 3 historias aparece el final de la misión.
- **Receptor de señales** (`Q`): suena más fuerte cuanto mejor apuntas a un retrorreflector. Así se encuentra un hallazgo extra, el espejo del Apolo 14 en Fra Mauro (coordenadas de NSSDCA).
- **Saltador lunar**: el módulo en el que llegó Pibble. Pulsa `E` junto a él para subir y mantén `Espacio` para encender el motor. Si aterrizas a más de 2,2 m/s, rebotas, como el Surveyor 3.
- **Sonido** sintetizado con Web Audio, sin archivos. En la Luna no hay aire, así que lo que se oye llega por la radio y el traje de Pibble.
- El código está en [`src/game/`](src/game/).

## Stack

Vite, React 19, React Three Fiber 9 con drei (Three.js) y GSAP con ScrollTrigger.

```bash
npm install
npm run dev
```

## Regla de datos

Cada dato de [`src/data/artifacts.js`](src/data/artifacts.js) debe venir de una página oficial de NASA (NSSDCA, nasa.gov, science.nasa.gov o trek.nasa.gov) y aparecer en su lista `sources`. Para añadir un artefacto, se copia un objeto de esa lista.
