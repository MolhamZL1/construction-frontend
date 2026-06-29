import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { LoadingState } from '@/components/ui/LoadingState'
import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationDate, getNotificationBody, getNotificationTargetPath } from '../utils/notification-formatters'

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const notificationsQuery = useNotifications()
  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const readCount = notifications.length - unreadCount

  return (
    <PageLayout
      title="الإشعارات"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            رجوع
          </button>

          <button
            type="button"
            onClick={() => void notificationsQuery.refetch()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            تحديث
          </button>
        </div>
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
          <p className="text-sm text-slate-500">مقروءة</p>
          <p className="mt-2 text-3xl font-bold text-[#50683f]">{readCount}</p>
        </div>
      </section>

      {notificationsQuery.isLoading ? (
        <LoadingState label="جاري تحميل الإشعارات..." />
      ) : notificationsQuery.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">تعذر تحميل الإشعارات. حاول مرة ثانية.</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <BellIcon />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">لا توجد إشعارات حالياً</p>
          <p className="mt-1 text-xs text-slate-400">ستظهر التحديثات الجديدة هنا.</p>
        </div>
      ) : (
        <section className="space-y-3">
          {notifications.map((notification) => {
            const body = getNotificationBody(notification)

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => navigate(getNotificationTargetPath(notification))}
                className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:border-[#50683f]/30 hover:bg-slate-50"
              >
                <span className={notification.isRead ? 'mt-2 h-3 w-3 rounded-full bg-slate-300' : 'mt-2 h-3 w-3 rounded-full bg-orange-500'} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{notification.title}</span>
                    {!notification.isRead ? <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700">جديد</span> : null}
                  </span>
                  {body ? <span className="mt-2 block text-sm leading-7 text-slate-600">{body}</span> : null}
                  <span className="mt-3 block text-xs text-slate-400">{formatNotificationDate(notification.createdAt)}</span>
                </span>
              </button>
            )
          })}
        </section>
      )}
    </PageLayout>
  )
}
