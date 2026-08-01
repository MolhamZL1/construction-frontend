import { useNavigate } from 'react-router-dom'

import { NotificationCard } from '../components/page/NotificationCard'
import { NotificationsPageHeader } from '../components/page/NotificationsPageHeader'
import { NotificationsEmptyState, NotificationsErrorState, NotificationsLoadingState } from '../components/page/NotificationsStates'
import { useNotifications } from '../hooks/useNotifications'
import { getNotificationTargetPath } from '../utils/notification-formatters'

export function NotificationsPage() {
  const navigate = useNavigate()
  const notificationsQuery = useNotifications()
  const notifications = notificationsQuery.data ?? []

  return (
    <main className="min-h-full bg-white px-4 py-6 text-right sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <NotificationsPageHeader
          isRefreshing={notificationsQuery.isFetching}
          onBack={() => navigate(-1)}
          onRefresh={() => void notificationsQuery.refetch()}
        />


        <section className="rounded-[1.75rem] border border-[rgb(var(--color-brand-ink-rgb)/0.08)] bg-[var(--color-brand-paper-warm)] p-3 shadow-[0_12px_36px_rgb(var(--color-brand-ink-rgb)/0.04)] sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base font-black text-[var(--color-brand-ink)]">جميع الإشعارات</h2>
              <p className="mt-1 text-xs font-semibold text-[var(--color-brand-stone)]">مرتبة من الأحدث إلى الأقدم</p>
            </div>

            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-[rgb(var(--color-brand-ink-rgb)/0.08)] bg-white px-3 text-sm font-black tabular-nums text-[var(--color-brand-ink)] shadow-sm">
              {notifications.length}
            </span>
          </div>

          {notificationsQuery.isLoading ? (
            <NotificationsLoadingState />
          ) : notificationsQuery.error ? (
            <NotificationsErrorState onRetry={() => void notificationsQuery.refetch()} />
          ) : notifications.length === 0 ? (
            <NotificationsEmptyState />
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onOpen={() => navigate(getNotificationTargetPath(notification))}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
