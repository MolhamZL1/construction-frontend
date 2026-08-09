import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { BrandLogo } from '@/components/brand/BrandLogo'

type ServerUnavailableState = {
  from?: string
} | null

const SERVER_ERROR_RETURN_PATH_KEY = 'mutqin:server-error-return-path'

function normalizeReturnPath(value?: string | null) {
  if (!value || value === '/server-error' || value.startsWith('/server-error?')) {
    return '/'
  }

  return value
}

function getNavigationType() {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  return entry?.type
}

export function ServerUnavailablePage() {
  const location = useLocation()
  const state = location.state as ServerUnavailableState
  const storedPath = window.sessionStorage.getItem(SERVER_ERROR_RETURN_PATH_KEY)
  const retryPath = normalizeReturnPath(state?.from ?? storedPath)

  useEffect(() => {
    if (getNavigationType() !== 'reload') {
      return
    }

    window.sessionStorage.removeItem(SERVER_ERROR_RETURN_PATH_KEY)
    window.location.replace(retryPath)
  }, [retryPath])

  function handleRetry() {
    window.sessionStorage.removeItem(SERVER_ERROR_RETURN_PATH_KEY)
    window.location.replace(retryPath)
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-[var(--color-brand-paper)] px-5 py-10 text-center"
      dir="rtl"
    >
      <section className="w-full max-w-md">
        <BrandLogo variant="horizontal" className="mx-auto w-32 sm:w-36" />

        <div className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-3xl border border-[rgb(var(--color-brand-gold-rgb)/0.22)] bg-white text-[var(--color-brand-gold-deep)] shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.08)]">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M12 8v4" strokeLinecap="round" />
            <path d="M12 16h.01" strokeLinecap="round" />
            <path
              d="M10.3 3.9 2.8 17a2 2 0 0 0 1.74 3h14.92A2 2 0 0 0 21.2 17L13.7 3.9a2 2 0 0 0-3.4 0Z"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-black text-[var(--color-brand-ink)] sm:text-3xl">
          تعذر الاتصال بالخادم
        </h1>

        <button
          type="button"
          onClick={handleRetry}
          className="mt-8 inline-flex h-12 min-w-40 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] px-6 text-sm font-black text-white shadow-[0_12px_28px_rgb(var(--color-brand-ink-rgb)/0.14)] transition hover:opacity-95 active:scale-[0.98]"
        >
          إعادة المحاولة
        </button>
      </section>
    </main>
  )
}
