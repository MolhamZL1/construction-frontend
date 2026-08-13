import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyDesignSystem } from './config/apply-design-system'
import './index.css'
import { App } from './app/App'
import { AppProvider } from './app/providers/AppProvider'

applyDesignSystem()


const APP_BOOT_MIN_VISIBLE_MS = 620
const appBootReactStartedAt = performance.now()

function dismissAppBootLoader() {
  const loader = document.getElementById('app-boot-loader')
  if (!loader) return

  const elapsed = performance.now() - appBootReactStartedAt
  const remaining = Math.max(0, APP_BOOT_MIN_VISIBLE_MS - elapsed)

  window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      loader.classList.add('app-boot-loader--exit')

      window.setTimeout(() => {
        loader.remove()
      }, 420)
    })
  }, remaining)
}

function dismissAppBootLoaderWhenReady() {
  if (document.readyState === 'complete') {
    dismissAppBootLoader()
    return
  }

  window.addEventListener('load', dismissAppBootLoader, { once: true })
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
)
