# Abandonados, no olvidados

NASA Space Apps 2026: *Abandoned but not Forgotten*. Las máquinas que NASA dejó en la Luna cuentan su propia historia, en primera persona.

## MVP

- Globo 3D de la Luna con las teselas oficiales de **NASA Moon Trek** (mosaico LRO WAC).
- "Fantasmas" en las coordenadas reales (NSSDCA) de 3 artefactos: el retrorreflector del Apolo 11, el rover lunar del Apolo 15 y el Surveyor 3.
- Historia por capítulos con animaciones al hacer scroll, sección "¿Mito o realidad?", lectura en voz alta y fuentes de NASA en cada ficha.

## Stack

Vite, React 19, React Three Fiber 9 con drei (Three.js) y GSAP con ScrollTrigger.

```bash
npm install
npm run dev
```

## Regla de datos

Cada dato de [`src/data/artifacts.js`](src/data/artifacts.js) debe venir de una página oficial de NASA (NSSDCA, nasa.gov, science.nasa.gov o trek.nasa.gov) y aparecer en su lista `sources`. Para añadir un artefacto, se copia un objeto de esa lista.
