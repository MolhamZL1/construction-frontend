#!/usr/bin/env bash
set -euo pipefail

D="$(pwd)"
S="$D/src"

if [ ! -f "$D/package.json" ]; then
  echo "❌ شغّل السكريبت من داخل مجلد المشروع الذي يحتوي package.json"
  exit 1
fi

if [ ! -d "$S" ]; then
  echo "❌ مجلد src غير موجود"
  exit 1
fi

echo "▶ 1/5 Keeping only auth and dashboard features..."

mkdir -p "$S/features"

for dir in "$S/features"/*; do
  [ -d "$dir" ] || continue
  name="$(basename "$dir")"

  if [ "$name" != "auth" ] && [ "$name" != "dashboard" ]; then
    echo "Removing feature: $name"
    rm -rf "$dir"
  fi
done

echo "▶ 2/5 Creating minimal folders..."

mkdir -p "$S/app/routes"
mkdir -p "$S/app/providers"

mkdir -p "$S/components/layout"
mkdir -p "$S/components/ui"

mkdir -p "$S/features/auth/pages"
mkdir -p "$S/features/auth/api"
mkdir -p "$S/features/auth/hooks"
mkdir -p "$S/features/auth/models"

mkdir -p "$S/features/dashboard/pages"
mkdir -p "$S/features/dashboard/components"

mkdir -p "$S/stores"
mkdir -p "$S/lib"
mkdir -p "$S/config"
mkdir -p "$S/types"
mkdir -p "$S/utils"

echo "▶ 3/5 Writing shared base files..."

cat > "$S/types/index.ts" <<'TS'
export type UserRole =
  | 'admin'
  | 'project_manager'
  | 'assistant_engineer'
  | 'owner'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}
TS

cat > "$S/config/env.ts" <<'TS'
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'نظام إدارة مشاريع الإكساء',
} as const
TS

cat > "$S/utils/cn.ts" <<'TS'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
TS

cat > "$S/lib/axios.ts" <<'TS'
import axios from 'axios'
import { env } from '@/config/env'

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
TS

cat > "$S/stores/authStore.ts" <<'TS'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem('access_token', token)
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null })
      },

      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
TS

cat > "$S/stores/uiStore.ts" <<'TS'
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
TS

echo "▶ 4/5 Writing layout, auth, and dashboard files..."

cat > "$S/components/layout/Sidebar.tsx" <<'TSX'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

const links = [
  {
    label: 'لوحة التحكم',
    to: '/dashboard',
  },
]

export function Sidebar() {
  return (
    <aside className="h-screen w-64 border-l border-slate-200 bg-white p-4" dir="rtl">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-slate-900">نظام الإكساء</h1>
        <p className="mt-1 text-sm text-slate-500">إدارة مشاريع الإكساء</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'block rounded-xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
TSX

cat > "$S/components/layout/AppShell.tsx" <<'TSX'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/stores/authStore'

export function AppShell() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <p className="text-sm text-slate-500">مرحباً</p>
            <p className="font-semibold text-slate-900">{user?.name ?? 'مستخدم تجريبي'}</p>
          </div>

          <div className="text-sm text-slate-500">
            {user?.role ?? 'admin'}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
TSX

cat > "$S/features/auth/pages/LoginPage.tsx" <<'TSX'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  function handleDemoLogin() {
    setAuth(
      {
        id: 'demo-admin',
        name: 'Admin Demo',
        email: 'admin@example.com',
        role: 'admin',
      },
      'demo-token'
    )

    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">تسجيل الدخول</h1>
        <p className="mt-2 text-sm text-slate-500">
          هذه صفحة مبدئية. سنربطها لاحقاً مع API الحقيقي.
        </p>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          دخول تجريبي
        </button>
      </div>
    </div>
  )
}
TSX

cat > "$S/features/dashboard/pages/DashboardPage.tsx" <<'TSX'
export function DashboardPage() {
  return (
    <section className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-slate-500">
          سنبدأ من هنا ببناء النظام Feature by Feature.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">المشاريع</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">المهام النشطة</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">تنبيهات</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
        </div>
      </div>
    </section>
  )
}
TSX

cat > "$S/app/routes/router.tsx" <<'TSX'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AppShell />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
])
TSX

cat > "$S/app/App.tsx" <<'TSX'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'

export function App() {
  return <RouterProvider router={router} />
}
TSX

cat > "$S/main.tsx" <<'TSX'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
TSX

cat > "$S/features/auth/index.ts" <<'TS'
export {}
TS

cat > "$S/features/dashboard/index.ts" <<'TS'
export {}
TS

echo "▶ 5/5 Build check..."
npm run build

echo ""
echo "✅ تم تنظيف الـ features والإبقاء فقط على auth و dashboard مع sidebar"
echo ""
echo "شغّل المشروع:"
echo "npm run dev"
