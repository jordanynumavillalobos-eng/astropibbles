
import { useState } from 'react'
import './App.css'

function App() {
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

        {iniciada && (
          <p className="mensaje">
            ¡Prepárate, astronauta! Nuestra primera misión
            está en camino.
          </p>
        )}
      </section>
    </main>
  )
}

export default App
