import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AuthHeroPanel } from '../components/AuthHeroPanel'
import { LoginForm } from '../forms/LoginForm'

export function LoginPage() {
  const hydrated = useAuthStore((state) => state.hydrated)
  const token = useAuthStore((state) => state.token)

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500" dir="rtl">
        جاري تجهيز صفحة الدخول...
      </main>
    )
  }

  if (hydrated && token) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="min-h-screen bg-white" dir="rtl">
      <div className="grid min-h-screen lg:grid-cols-[52.1%_47.9%]">
        <AuthHeroPanel />

        <section className="flex min-h-[calc(100vh-260px)] items-start justify-center bg-white sm:min-h-[calc(100vh-340px)] lg:min-h-screen lg:items-center">
          <LoginForm />
        </section>
      </div>
    </main>
  )
}
