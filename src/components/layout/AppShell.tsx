import { Outlet, useNavigate } from 'react-router-dom'

import { useSignOut } from '@/features/auth/hooks/useLoginCompany'
import { isInternalUser } from '@/features/auth/utils/auth-navigation'
import { NotificationsMenu, NotificationToastViewport } from '@/features/notifications'
import { useInAppNotificationCards } from '@/features/notifications/hooks/useNotifications'
import { useFcmTokenRegistration } from '@/features/notifications/hooks/useFcmTokenRegistration'
import { AiChatAppbarWidget, AiInspectionFloatingWidget } from '@/features/tools'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/authStore'

import { Sidebar } from './Sidebar'

function getAppbarRoleLabel(role?: string) {
  if (role === 'project_manager') return 'المهندس'
  if (role === 'assistant') return 'المساعد'
  if (role === 'company_admin') return 'مدير الشركة'
  if (role === 'project_owner') return 'مالك المشروع'

  return role || 'مستخدم النظام'
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#50683f] text-sm font-black text-white shadow-sm">
      {initials || 'م'}
    </span>
  )
}

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const signOutMutation = useSignOut()
  const notificationCards = useInAppNotificationCards()
  useFcmTokenRegistration()

  const hideSidebar = isInternalUser(user)
  const displayName = user?.name?.trim() || 'مستخدم النظام'
  const roleLabel = getAppbarRoleLabel(user?.role)
  const showUserSummary = Boolean(user && hideSidebar)

  async function handleLogout() {
    try {
      await signOutMutation.mutateAsync()
    } catch {
      // Local logout is still required if the server session is already expired.
    } finally {
      logout()
      queryClient.clear()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row" dir="rtl">
      {hideSidebar ? null : <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)] sm:px-6"
          dir="rtl"
        >
          <div className="min-w-0 flex-1">
            {showUserSummary ? (
              <div className="flex min-w-0 items-center gap-3 text-right">
                <UserAvatar name={displayName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-[#50683f]">{roleLabel}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-3" dir="ltr">
            <button
              type="button"
              onClick={handleLogout}
              disabled={signOutMutation.isPending}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#eef4eb] px-3 text-sm font-medium text-[#50683f] transition hover:bg-[#e1ebdc] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  d="M15 17l5-5-5-5M20 12H9M11 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{signOutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
            </button>

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 sm:flex"
              aria-label="الإعدادات"
              title="الإعدادات"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path
                  d="M19 12a7.5 7.5 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.9-1.1L14.3 3h-4l-.4 2.9A8 8 0 0 0 8 7L5.6 6l-2 3.4 2 1.5A7.5 7.5 0 0 0 5.5 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4L8 17a8 8 0 0 0 1.9 1.1l.4 2.9h4l.4-2.9a8 8 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1.1Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <NotificationsMenu />
            <AiChatAppbarWidget />
          </div>
        </header>

        <main className="min-h-0 flex-1 bg-slate-50">
          <Outlet />
        </main>

        <AiInspectionFloatingWidget />

        <NotificationToastViewport
          toasts={notificationCards.toasts}
          onDismiss={notificationCards.dismissToast}
          onOpen={(toast) => {
            notificationCards.dismissToast(toast.id)
            navigate(toast.targetPath || '/notifications')
          }}
        />
      </div>
    </div>
  )
}
