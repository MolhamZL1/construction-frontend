import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { BrandLogo } from '@/components/brand/BrandLogo'
import { useSignOut } from '@/features/auth/hooks/useLoginCompany'
import { isCompanyAdmin, isInternalUser, isProjectManager } from '@/features/auth/utils/auth-navigation'
import { NotificationsMenu, NotificationToastViewport } from '@/features/notifications'
import { useFcmTokenRegistration } from '@/features/notifications/hooks/useFcmTokenRegistration'
import { useInAppNotificationCards } from '@/features/notifications/hooks/useNotifications'
import { AiChatAppbarWidget, AiInspectionFloatingWidget } from '@/features/tools'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/authStore'

import { Sidebar } from './Sidebar'
import { APP_CONFIG } from '@/config/design-system'

function getAppbarRoleLabel(role?: string) {
  if (role === 'project_manager') return 'المهندس'
  if (role === 'assistant') return 'المساعد'
  if (role === 'company_admin') return 'مدير الشركة'
  if (role === 'project_owner') return 'مالك المشروع'

  return role || 'مستخدم النظام'
}

function UserAvatar({ name }: { name: string }) {
  return (
    <span
      className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgb(var(--color-brand-gold-rgb)/0.25)] bg-[var(--color-brand-paper)] shadow-sm sm:flex"
      aria-label={name}
      title={name}
    >
      <BrandLogo variant="mark" className="h-7 w-7" />
    </span>
  )
}

function LogoutIcon({ pending = false }: { pending?: boolean }) {
  if (pending) {
    return <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path
        d="M15 17l5-5-5-5M20 12H9M11 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const signOutMutation = useSignOut()
  const notificationCards = useInAppNotificationCards()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  useFcmTokenRegistration()

  const hideSidebar = isInternalUser(user)
  const displayName = user?.name?.trim() || 'مستخدم النظام'
  const roleLabel = getAppbarRoleLabel(user?.role)

  async function handleLogout() {
    if (signOutMutation.isPending) return

    try {
      await signOutMutation.mutateAsync()
    } catch {
      // تسجيل الخروج محلياً مطلوب حتى لو انتهت جلسة الخادم.
    } finally {
      setLogoutDialogOpen(false)
      logout()
      queryClient.clear()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-brand-paper)] lg:flex-row" dir="rtl">
      {hideSidebar ? null : <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="relative z-[70] flex h-[72px] items-center border-b border-[rgb(var(--color-brand-ink-rgb)/0.1)] bg-white/95 px-4 shadow-[0_1px_4px_rgb(var(--color-brand-ink-rgb)/0.07)] backdrop-blur-xl sm:px-6"
          dir="rtl"
        >
          <div
            className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 sm:left-6"
            dir="ltr"
          >
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              disabled={signOutMutation.isPending}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--color-brand-ink-rgb)/0.1)] bg-white text-[var(--color-brand-ink)] shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <LogoutIcon pending={signOutMutation.isPending} />
            </button>

            <div dir="rtl">
              <NotificationsMenu />
            </div>
          </div>

          <div className="absolute right-4 top-1/2 flex max-w-[calc(100%-8.5rem)] -translate-y-1/2 items-center gap-3 text-right sm:right-6 sm:max-w-[55vw]">
            <UserAvatar name={displayName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[var(--color-brand-ink)] sm:text-[15px]">{displayName}</p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-[var(--color-brand-stone)] sm:text-xs">{roleLabel}</p>
            </div>
          </div>
        </header>

        <main className="relative z-0 min-h-0 flex-1 bg-[var(--color-brand-paper)]">
          <Outlet />
        </main>

        {isProjectManager(user) ? <AiInspectionFloatingWidget /> : null}
        {isCompanyAdmin(user) ? <AiChatAppbarWidget /> : null}

        <NotificationToastViewport
          toasts={notificationCards.toasts}
          onDismiss={notificationCards.dismissToast}
          onOpen={(toast) => {
            notificationCards.dismissToast(toast.id)
            navigate(toast.targetPath || '/notifications')
          }}
        />
      </div>

      {logoutDialogOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(var(--color-brand-ink-deep-rgb)/0.45)] p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !signOutMutation.isPending) {
              setLogoutDialogOpen(false)
            }
          }}
        >
          <section
            className="w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/95 p-5 text-right shadow-[0_28px_90px_rgb(var(--color-brand-ink-deep-rgb)/0.28)] backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <LogoutIcon />
            </span>
            <h2 id="logout-dialog-title" className="mt-4 text-lg font-black text-[var(--color-brand-ink)]">
              تسجيل الخروج من {APP_CONFIG.name}؟
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-brand-stone)]">
              رح تحتاج تدخل بيانات حسابك مرة ثانية للرجوع إلى النظام.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutDialogOpen(false)}
                disabled={signOutMutation.isPending}
                className="h-11 rounded-2xl border border-[rgb(var(--color-brand-ink-rgb)/0.1)] bg-white text-sm font-black text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-paper)] disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signOutMutation.isPending}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogoutIcon pending={signOutMutation.isPending} />
                {signOutMutation.isPending ? 'جاري الخروج' : 'تأكيد الخروج'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
