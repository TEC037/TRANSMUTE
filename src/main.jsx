import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
      <Toaster position="bottom-center" offset={88} toastOptions={{
        style: {
          background: 'rgba(5, 5, 5, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#E2E8F0',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          fontSize: '11px',
          fontWeight: 'bold',
          padding: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }
      }} />
    </HashRouter>
  </StrictMode>,
)
