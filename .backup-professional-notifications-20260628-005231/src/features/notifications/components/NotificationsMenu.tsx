import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerAuthenticatedDevice } from '../api/fcm.api'
import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationDate, getNotificationTargetPath } from '../utils/notification-formatters'

export function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabling, setIsEnabling] = useState(false)
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const notificationsQuery = useNotifications()

  const notifications = notificationsQuery.data ?? []
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications])
  const visibleNotifications = notifications.slice(0, 8)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleToggle() {
    setIsOpen((value) => !value)
    setPermissionMessage(null)
    await notificationsQuery.refetch()
  }

  async function handleEnableNotifications() {
    setIsEnabling(true)
    setPermissionMessage(null)

    try {
      const token = await registerAuthenticatedDevice({ requestPermission: true, forceSend: true })
      setPermissionMessage(token ? 'تم تفعيل إشعارات المتصفح.' : 'لم يتم تفعيل إشعارات المتصفح. تأكد من VAPID key والسماح من المتصفح.')
    } catch {
      setPermissionMessage('تعذر إرسال FCM token للباك اند. تحقق من endpoint والصلاحيات.')
    } finally {
      setIsEnabling(false)
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
        aria-label="الإشعارات"
        title="الإشعارات"
      >
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        ) : null}
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-right shadow-xl" dir="rtl">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">الإشعارات</h2>
              <p className="mt-0.5 text-xs text-slate-500">{unreadCount ? `${unreadCount} إشعارات غير مقروءة` : 'لا يوجد إشعارات غير مقروءة'}</p>
            </div>
            <button type="button" onClick={handleEnableNotifications} disabled={isEnabling} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60">
              {isEnabling ? 'جاري التفعيل...' : 'تفعيل المتصفح'}
            </button>
          </div>

          {permissionMessage ? <div className="mx-4 mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{permissionMessage}</div> : null}

          <div className="max-h-[420px] overflow-y-auto p-2">
            {notificationsQuery.isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">جاري تحميل الإشعارات...</div>
            ) : notificationsQuery.error ? (
              <div className="px-4 py-8 text-center text-sm text-rose-600">تعذر تحميل الإشعارات.</div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">لا توجد إشعارات حالياً.</div>
            ) : (
              visibleNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    navigate(getNotificationTargetPath(notification))
                  }}
                  className="flex w-full gap-3 rounded-xl px-3 py-3 text-right transition hover:bg-slate-50"
                >
                  <span className={notification.isRead ? 'mt-1 h-2.5 w-2.5 rounded-full bg-slate-300' : 'mt-1 h-2.5 w-2.5 rounded-full bg-orange-500'} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{notification.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">{notification.body || '—'}</span>
                    <span className="mt-1 block text-[11px] text-slate-400">{formatNotificationDate(notification.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              navigate('/notifications')
            }}
            className="block w-full border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-[#50683f] transition hover:bg-slate-50"
          >
            عرض كل الإشعارات
          </button>
        </div>
      ) : null}
    </div>
  )
}
