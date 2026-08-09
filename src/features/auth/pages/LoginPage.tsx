import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/stores/authStore'

import { AuthHeroPanel } from '../components/AuthHeroPanel'
import { LoginForm } from '../forms/LoginForm'
import { getAuthenticatedHomePath } from '../utils/auth-navigation'

export function LoginPage() {
  const hydrated = useAuthStore((state) => state.hydrated)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (!hydrated) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[var(--color-brand-paper)] text-sm font-bold text-[var(--color-brand-stone)]"
        dir="rtl"
      >
        جارٍ تجهيز صفحة تسجيل الدخول...
      </main>
    )
  }

  if (token) {
    return <Navigate to={getAuthenticatedHomePath(user)} replace />
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-brand-paper)]" dir="rtl">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]" dir="ltr">
        <div className="hidden lg:block">
          <AuthHeroPanel />
        </div>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-10 lg:px-12 xl:px-16" dir="rtl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-white/95 blur-[70px]" />
            <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-[rgb(var(--color-brand-gold-rgb)/0.2)] blur-[90px]" />
            <div className="absolute left-[18%] top-[38%] h-56 w-56 rounded-full bg-[rgb(var(--color-brand-stone-rgb)/0.1)] blur-[72px]" />
          </div>

          <LoginForm />
        </section>
      </div>
    </main>
  )
}
