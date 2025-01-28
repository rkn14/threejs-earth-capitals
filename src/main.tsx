import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import Scene from './components/scene.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Scene />
  </StrictMode>,
)
