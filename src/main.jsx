import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PibblePreview from './game/PibblePreview.jsx'

// ?pibble abre la vista del personaje (para el equipo de diseño).
const preview = new URLSearchParams(location.search).has('pibble')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {preview ? <PibblePreview /> : <App />}
  </StrictMode>,
)
