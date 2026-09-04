import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from '@/app/App'
import { registerServiceWorker } from '@/app/pwa/registerSW'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the PWA service worker (offline shell, caching, push).
registerServiceWorker()

// Warm + decode every feature icon once so navigation never re-flickers them.
