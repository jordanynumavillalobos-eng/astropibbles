import GaleriaNASA from "./components/GaleriaNASA";
import { buscarImagenesNASA } from "./services/nasaApi";
import { useState } from 'react'
import './App.css'

function App() {
  const probarNASA = async () => {
  try {
    const imagenes = await buscarImagenesNASA();
    console.log("Imágenes obtenidas de NASA:", imagenes);
  } catch (error) {
    console.error("Error al conectar con NASA:", error);
  }
};
  const [iniciada, setIniciada] = useState(false)

  return (
    <main className="app">
      <div className="estrellas"></div>

      <section className="bienvenida">
        <span className="etiqueta">NASA SPACE APPS CHALLENGE</span>

        <div className="planeta">🪐</div>

        <h1>ASTROPIBBLES</h1>
        <h2>Relatos del Espacio</h2>

        <p>
          ¡Hola, explorador! Soy Pibble y te acompañaré
          a descubrir las increíbles historias de las
          misiones espaciales.
        </p>

        <button onClick={() => setIniciada(true)}>
          🚀 ¡Comenzar aventura!
        </button>

        <button onClick={probarNASA}>
         📡 Probar conexión NASA
        </button>

        {iniciada && (
          <p className="mensaje">
            ¡Prepárate, astronauta! Nuestra primera misión
            está en camino.
          </p>
        )}
      </section>

<GaleriaNASA />

    </main>
  )
}

export default App
