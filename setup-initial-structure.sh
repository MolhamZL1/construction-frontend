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

echo "▶ 1/5 Installing base dependencies..."

npm install \
  react-router-dom \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  zustand \
  axios \
  react-hook-form \
  @hookform/resolvers \
  zod \
  clsx \
  tailwind-merge

npm install -D \
  tailwindcss \
  @tailwindcss/vite \
  prettier \
  @types/node

echo "▶ 2/5 Creating folders..."

mkdir -p "$S/app/routes"
mkdir -p "$S/app/providers"

mkdir -p "$S/components/ui"
mkdir -p "$S/components/layout"
mkdir -p "$S/components/forms"
mkdir -p "$S/components/feedback"
mkdir -p "$S/components/data-display"

mkdir -p "$S/hooks"
mkdir -p "$S/stores"
mkdir -p "$S/lib"
mkdir -p "$S/config"
mkdir -p "$S/types"
mkdir -p "$S/utils"

mkdir -p "$S/algorithms/material-calc"
mkdir -p "$S/algorithms/measurement-sheets"
mkdir -p "$S/algorithms/cpm"
mkdir -p "$S/algorithms/delay-analysis"

for F in \
  auth \
  users \
  projects \
  spaces \
  work-items \
  material-estimation \
  measurement-sheets \
  scheduling \
  delay-prediction \
  inventory \
  contracts \
  documents \
  reports \
  dashboard
do
  mkdir -p "$S/features/$F/api"
  mkdir -p "$S/features/$F/dtos"
  mkdir -p "$S/features/$F/models"
  mkdir -p "$S/features/$F/mappers"
  mkdir -p "$S/features/$F/hooks"
  mkdir -p "$S/features/$F/components"
  mkdir -p "$S/features/$F/pages"
  mkdir -p "$S/features/$F/forms"
  mkdir -p "$S/features/$F/utils"

  cat > "$S/features/$F/index.ts" <<TS
export {}
TS
done

echo "▶ 3/5 Writing config files..."

cat > "$D/vite.config.ts" <<'TS'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
TS

cat > "$D/tsconfig.json" <<'JSON'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
JSON

cat > "$D/tsconfig.app.json" <<'JSON'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
JSON

cat > "$D/tsconfig.node.json" <<'JSON'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "types": ["node"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
JSON

cat > "$D/.env.example" <<'ENV'
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ML_SERVICE_URL=http://localhost:9000
VITE_APP_NAME=نظام إدارة مشاريع الإكساء
ENV

if [ ! -f "$D/.env" ]; then
  cp "$D/.env.example" "$D/.env"
fi

cat > "$D/.prettierrc" <<'JSON'
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
JSON

echo "▶ 4/5 Writing initial source code..."

rm -f "$S/App.css" "$S/App.tsx" "$S/assets/react.svg" "$D/public/vite.svg"

cat > "$S/vite-env.d.ts" <<'TS'
/// <reference types="vite/client" />

declare module '*.css'
TS

cat > "$S/index.css" <<'CSS'
@import "tailwindcss";

:root {
  font-family: system-ui, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  direction: rtl;
  background: #f8fafc;
}
CSS

cat > "$S/config/env.ts" <<'TS'
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  ML_SERVICE_URL: import.meta.env.VITE_ML_SERVICE_URL ?? 'http://localhost:9000',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'نظام إدارة مشاريع الإكساء',
} as const
TS

cat > "$S/config/constants.ts" <<'TS'
export const SPACE_TYPES = [
  'غرفة',
  'صالون',
  'مطبخ',
  'حمام',
  'مرحاض',
  'ممر',
  'مدخل',
  'بلكون',
  'سقيفة / بروز',
  'آخر',
] as const

export const FINISH_TYPES = [
  'دهان',
  'سيراميك',
  'جبس',
  'بدون',
  'آخر',
] as const

export const TOILET_TYPES = [
  'لا يوجد',
  'عربي',
  'فرنجي',
] as const

export const PACKAGE_TYPES = [
  'عادي',
  'جيد',
  'ممتاز',
] as const

export const DEFAULT_WORK_ITEMS = [
  'ملابن الأبواب',
  'تمديدات كهرباء',
  'تمديدات صحية',
  'طينة / لياسة',
  'طبقة تحت البلاط',
  'بلاط أرضيات',
  'سيراميك جدران / أسقف',
  'جبس بورد',
  'دهان',
  'أبواب ونجارة',
  'ألمنيوم وأبجورات',
  'تشطيبات نهائية',
] as const
TS

cat > "$S/types/index.ts" <<'TS'
export type UserRole =
  | 'admin'
  | 'project_manager'
  | 'assistant_engineer'
  | 'owner'

export interface ApiEnvelope<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedEnvelope<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}
TS

cat > "$S/config/permissions.ts" <<'TS'
import type { UserRole } from '@/types'

export type Permission =
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:assign'
  | 'spaces:write'
  | 'work-items:write'
  | 'reports:read'

const PERMISSIONS_BY_ROLE: Record<UserRole, Permission[]> = {
  admin: [
    'project:create',
    'project:read',
    'project:update',
    'project:assign',
    'spaces:write',
    'work-items:write',
    'reports:read',
  ],
  project_manager: [
    'project:read',
    'project:update',
    'spaces:write',
    'work-items:write',
    'reports:read',
  ],
  assistant_engineer: [
    'project:read',
    'reports:read',
  ],
  owner: [
    'project:read',
    'reports:read',
  ],
}

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return PERMISSIONS_BY_ROLE[role]?.includes(permission) ?? false
}
TS

cat > "$S/utils/cn.ts" <<'TS'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
TS

cat > "$S/utils/format.ts" <<'TS'
export function formatArea(value: number) {
  return `${value.toLocaleString('ar-SY')} م²`
}

export function formatCurrency(value: number, currency = 'SYP') {
  return new Intl.NumberFormat('ar-SY', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.replace('/login')
    }

    return Promise.reject(error)
  }
)
TS

cat > "$S/lib/query-client.ts" <<'TS'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300_000,
      gcTime: 600_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
TS

cat > "$S/stores/authStore.ts" <<'TS'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

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
  activeProjectId: string | null
  toggleSidebar: () => void
  setActiveProjectId: (projectId: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeProjectId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
}))
TS

cat > "$S/hooks/usePermissions.ts" <<'TS'
import { hasPermission, type Permission } from '@/config/permissions'
import { useAuthStore } from '@/stores/authStore'

export function usePermissions() {
  const role = useAuthStore((state) => state.user?.role)

  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    isAdmin: role === 'admin',
    isProjectManager: role === 'project_manager',
    isAssistantEngineer: role === 'assistant_engineer',
    isOwner: role === 'owner',
  }
}
TS

cat > "$S/components/layout/PageLayout.tsx" <<'TSX'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageLayoutProps {
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageLayout({ title, children, actions, className }: PageLayoutProps) {
  return (
    <main className={cn('min-h-screen p-6 space-y-6', className)} dir="rtl">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>

      {children}
    </main>
  )
}
TSX

cat > "$S/components/layout/RoleGate.tsx" <<'TSX'
import type { ReactNode } from 'react'
import type { UserRole } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

interface RoleGateProps {
  allowedRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { role } = usePermissions()

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
TSX

cat > "$S/components/ui/index.ts" <<'TS'
export {}
TS

cat > "$S/app/providers/AppProvider.tsx" <<'TSX'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { queryClient } from '@/lib/query-client'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
TSX

cat > "$S/app/routes/router.tsx" <<'TSX'
import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageLayout title="نظام إدارة مشاريع الإكساء">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          تم تجهيز الهيكلية والأكواد المبدئية بنجاح.
        </div>
      </PageLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <PageLayout title="تسجيل الدخول">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          صفحة تسجيل الدخول - سنبنيها لاحقاً ضمن Feature auth.
        </div>
      </PageLayout>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PageLayout title="لوحة التحكم">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          Dashboard placeholder.
        </div>
      </PageLayout>
    ),
  },
])
TSX

cat > "$S/app/App.tsx" <<'TSX'
import { RouterProvider } from 'react-router-dom'
import { AppProvider } from './providers/AppProvider'
import { router } from './routes/router'

export function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
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

echo "▶ 5/5 Build check..."

npm run build

echo ""
echo "✅ تم إنشاء الهيكلية مع أكواد مبدئية فقط"
echo ""
echo "شغّل المشروع:"
echo "npm run dev"
