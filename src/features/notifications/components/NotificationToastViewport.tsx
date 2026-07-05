import type { KeyboardEvent } from 'react'
import type { NotificationToast } from '../hooks/useNotifications'

interface NotificationToastViewportProps {
  toasts: NotificationToast[]
  onDismiss: (id: string) => void
  onOpen?: (toast: NotificationToast) => void
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OpenIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NotificationToastViewport({ toasts, onDismiss, onOpen }: NotificationToastViewportProps) {
  if (!toasts.length) return null

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, toast: NotificationToast) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen?.(toast)
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[80] flex w-[min(92vw,430px)] -translate-x-1/2 flex-col gap-3" dir="rtl">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={onOpen ? 'button' : undefined}
          tabIndex={onOpen ? 0 : undefined}
          onClick={() => onOpen?.(toast)}
          onKeyDown={(event) => handleKeyDown(event, toast)}
          className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white text-right shadow-[0_20px_60px_rgba(15,23,42,0.18)] outline-none transition hover:-translate-y-0.5 hover:border-[#50683f]/30 hover:shadow-[0_22px_70px_rgba(15,23,42,0.22)] focus:ring-2 focus:ring-[#50683f]/20"
          title={onOpen ? 'فتح الإشعار' : undefined}
        >
          <div className="flex gap-3 px-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
              <BellIcon />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-slate-900">{toast.title}</p>
                {onOpen ? <span className="shrink-0 text-slate-300"><OpenIcon /></span> : null}
              </div>
              {toast.body ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{toast.body}</p> : null}
              {onOpen ? <p className="mt-1.5 text-[11px] font-bold text-[#50683f]">اضغط لفتح التفاصيل</p> : null}
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDismiss(toast.id)
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="إغلاق الإشعار"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="h-1 bg-[#50683f]" />
        </div>
      ))}
    </div>
  )
}
