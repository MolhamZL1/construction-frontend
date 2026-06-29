import { useState } from 'react'
import { useFcmNotifications } from '../hooks/useFcmNotifications'

function getStatusLabel(status: ReturnType<typeof useFcmNotifications>['status']) {
  if (status === 'granted') return 'الإشعارات مفعلة'
  if (status === 'denied') return 'الإشعارات مرفوضة من المتصفح'
  if (status === 'unsupported') return 'المتصفح لا يدعم إشعارات الويب'
  if (status === 'missing-config') return 'إعدادات Firebase ناقصة'
  if (status === 'missing-vapid') return 'VAPID key ناقص'

  return 'تفعيل الإشعارات'
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    status,
    isRegistering,
    latestTitle,
    latestBody,
    errorMessage,
    requestPermissionAndRegister,
    syncToken,
  } = useFcmNotifications()

  const hasAlert = Boolean(latestTitle || errorMessage || status !== 'granted')
  const canClick = status !== 'unsupported' && status !== 'missing-config' && !isRegistering

  async function handleClick() {
    setIsOpen((value) => !value)

    if (status === 'granted') {
      await syncToken()
      return
    }

    if (canClick) {
      await requestPermissionAndRegister()
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={!canClick}
        className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
        aria-label="الإشعارات"
        title={getStatusLabel(status)}
      >
        {hasAlert ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" /> : null}
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-xl" dir="rtl">
          <p className="text-sm font-semibold text-slate-900">الإشعارات</p>
          <p className="mt-1 text-xs text-slate-500">{isRegistering ? 'جاري تفعيل الإشعارات...' : getStatusLabel(status)}</p>

          {errorMessage ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{errorMessage}</p> : null}

          {latestTitle ? (
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{latestTitle}</p>
              {latestBody ? <p className="mt-1 text-xs leading-5 text-slate-600">{latestBody}</p> : null}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-slate-500">لا توجد إشعارات جديدة حالياً.</p>
          )}

          {status !== 'granted' && status !== 'unsupported' && status !== 'missing-config' ? (
            <button
              type="button"
              onClick={() => void requestPermissionAndRegister()}
              disabled={isRegistering}
              className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegistering ? 'جاري التفعيل...' : 'تفعيل الإشعارات'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
