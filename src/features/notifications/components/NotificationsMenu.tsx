import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationDate, getNotificationBody, getNotificationTargetPath } from '../utils/notification-formatters'
import { getNotificationPresentation } from '../utils/notification-presentation'
import { NotificationIcon } from './NotificationIcon'

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
  const visibleNotifications = notifications.slice(0, 6)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openNotification(path: string) {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div ref={menuRef} className="relative z-[110]" dir="rtl">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
        title="الإشعارات"
      >
        <BellIcon />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-[120] mt-3 w-[390px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white text-right shadow-[0_24px_70px_rgb(var(--color-brand-ink-rgb)/0.2)]" dir="rtl">
          <div className="border-b border-slate-100 bg-[linear-gradient(135deg,var(--color-brand-paper),white)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] text-white shadow-sm">
                  <BellIcon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-900">الإشعارات</h2>
              </div>
              </div>

              <button
                type="button"
                onClick={() => void notificationsQuery.refetch()}
                disabled={notificationsQuery.isFetching}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
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
                <button
                  type="button"
                  onClick={() => void notificationsQuery.refetch()}
                  className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <BellIcon />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">لا توجد إشعارات حالياً</p>
                <p className="mt-1 text-xs text-slate-400">ستظهر التحديثات هنا.</p>
              </div>
            ) : (
              visibleNotifications.map((notification) => {
                const body = getNotificationBody(notification)
                const targetPath = getNotificationTargetPath(notification)
                const presentation = getNotificationPresentation(notification)

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(targetPath)}
                    className="group flex w-full gap-3 rounded-2xl border border-transparent px-3 py-3 text-right transition hover:border-slate-100 hover:bg-slate-50"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${presentation.iconClassName}`}>
                      <NotificationIcon kind={presentation.kind} className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="truncate text-sm font-black text-slate-900">{notification.title}</span>
                      {body ? <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">{body}</span> : null}
                      <span className="mt-1.5 block text-[11px] font-semibold text-slate-400">{formatNotificationDate(notification.createdAt)}</span>
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => openNotification('/notifications')}
            className="block w-full border-t border-slate-100 bg-white px-4 py-3.5 text-center text-sm font-black text-[var(--color-brand-ink)] transition hover:bg-slate-50"
          >
            عرض كل الإشعارات
          </button>
        </div>
      ) : null}
    </div>
  )
}
