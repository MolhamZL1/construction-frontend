import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyDesignSystem } from './config/apply-design-system'
import './index.css'
import { App } from './app/App'
import { AppProvider } from './app/providers/AppProvider'

applyDesignSystem()


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
)
