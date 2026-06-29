import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationDate, getNotificationBody, getNotificationTargetPath } from '../utils/notification-formatters'

function BellIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M20 12a8 8 0 0 1-13.7 5.7M4 12A8 8 0 0 1 17.7 6.3M18 3v4h-4M6 21v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const notificationsQuery = useNotifications()

  const notifications = notificationsQuery.data ?? []
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications])
  const visibleNotifications = notifications.slice(0, 6)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleToggle() {
    const nextValue = !isOpen
    setIsOpen(nextValue)
    if (nextValue) void notificationsQuery.refetch()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="الإشعارات"
        title="الإشعارات"
      >
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        ) : null}
        <BellIcon />
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-50 mt-3 w-[390px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white text-right shadow-2xl" dir="rtl">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
                  <BellIcon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">الإشعارات</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{unreadCount ? `${unreadCount} غير مقروءة` : 'كل الإشعارات مقروءة'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void notificationsQuery.refetch()}
                disabled={notificationsQuery.isFetching}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                title="تحديث"
              >
                <RefreshIcon />
              </button>
            </div>
          </div>

          <div className="max-h-[430px] overflow-y-auto p-2">
            {notificationsQuery.isLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-slate-100 p-3">
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="mt-3 h-2 w-4/5 rounded bg-slate-100" />
                    <div className="mt-2 h-2 w-1/3 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : notificationsQuery.error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-800">تعذر تحميل الإشعارات</p>
                <button type="button" onClick={() => void notificationsQuery.refetch()} className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                  إعادة المحاولة
                </button>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <BellIcon />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">لا توجد إشعارات حالياً</p>
                <p className="mt-1 text-xs text-slate-400">ستظهر التحديثات الجديدة هنا.</p>
              </div>
            ) : (
              visibleNotifications.map((notification) => {
                const body = getNotificationBody(notification)

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate(getNotificationTargetPath(notification))
                    }}
                    className="group flex w-full gap-3 rounded-2xl px-3 py-3 text-right transition hover:bg-slate-50"
                  >
                    <span className={notification.isRead ? 'mt-1 h-2.5 w-2.5 rounded-full bg-slate-300' : 'mt-1 h-2.5 w-2.5 rounded-full bg-orange-500'} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-slate-900">{notification.title}</span>
                        {!notification.isRead ? <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">جديد</span> : null}
                      </span>
                      {body ? <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">{body}</span> : null}
                      <span className="mt-1.5 block text-[11px] text-slate-400">{formatNotificationDate(notification.createdAt)}</span>
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              navigate('/notifications')
            }}
            className="block w-full border-t border-slate-100 px-4 py-3.5 text-center text-sm font-bold text-[#50683f] transition hover:bg-slate-50"
          >
            عرض كل الإشعارات
          </button>
        </div>
      ) : null}
    </div>
  )
}
