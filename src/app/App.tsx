import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/authStore'

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function getEventFromPath(event: Event) {
  const detail = event instanceof CustomEvent ? event.detail : undefined
  const from = detail && typeof detail.from === 'string' ? detail.from : getCurrentPath()

  return from || '/'
}

export function App() {
  useEffect(() => {
    function handleUnauthenticated(event: Event) {
      useAuthStore.getState().logout()
      queryClient.clear()

      const from = getEventFromPath(event)
      if (window.location.pathname === '/login') return

      void router.navigate('/login', {
        replace: true,
        state: { from },
      })
    }

    function handleServerUnavailable(event: Event) {
      const from = getEventFromPath(event)
      if (window.location.pathname === '/server-error') return

      void router.navigate('/server-error', {
        replace: true,
        state: { from },
      })
    }

    window.addEventListener('app:unauthenticated', handleUnauthenticated)
    window.addEventListener('app:server-unavailable', handleServerUnavailable)

    return () => {
      window.removeEventListener('app:unauthenticated', handleUnauthenticated)
      window.removeEventListener('app:server-unavailable', handleServerUnavailable)
    }
  }, [])

  return <RouterProvider router={router} />
}
