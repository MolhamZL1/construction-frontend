import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { LoadingState } from '@/components/ui/LoadingState'
import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationDate, getNotificationTargetPath } from '../utils/notification-formatters'

export function NotificationsPage() {
  const navigate = useNavigate()
  const notificationsQuery = useNotifications()
  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <PageLayout
      title="الإشعارات"
      actions={
        <button
          type="button"
          onClick={() => void notificationsQuery.refetch()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          تحديث
        </button>
      }
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">كل الإشعارات</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{notifications.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">غير مقروءة</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{unreadCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">آخر تحديث</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{new Intl.DateTimeFormat('ar', { timeStyle: 'short' }).format(new Date())}</p>
        </div>
      </section>

      {notificationsQuery.isLoading ? (
        <LoadingState label="جاري تحميل الإشعارات..." />
      ) : notificationsQuery.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">تعذر تحميل الإشعارات. حاول مرة ثانية.</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">لا توجد إشعارات حالياً.</div>
      ) : (
        <section className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => navigate(getNotificationTargetPath(notification))}
              className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:border-[#50683f]/30 hover:bg-slate-50"
            >
              <span className={notification.isRead ? 'mt-2 h-3 w-3 rounded-full bg-slate-300' : 'mt-2 h-3 w-3 rounded-full bg-orange-500'} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-slate-900">{notification.title}</span>
                  {!notification.isRead ? <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">جديد</span> : null}
                </span>
                <span className="mt-2 block text-sm leading-7 text-slate-600">{notification.body || '—'}</span>
                <span className="mt-3 block text-xs text-slate-400">{formatNotificationDate(notification.createdAt)}</span>
              </span>
            </button>
          ))}
        </section>
      )}
    </PageLayout>
  )
}
