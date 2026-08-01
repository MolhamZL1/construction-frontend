import type { AppNotification } from '../../models/notification.model'
import { formatNotificationDate, getNotificationBody } from '../../utils/notification-formatters'
import { getNotificationPresentation } from '../../utils/notification-presentation'
import { NotificationIcon } from '../NotificationIcon'

interface NotificationCardProps {
  notification: AppNotification
  onOpen: () => void
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NotificationCard({ notification, onOpen }: NotificationCardProps) {
  const body = getNotificationBody(notification)
  const presentation = getNotificationPresentation(notification)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-start gap-3 overflow-hidden rounded-[1.4rem] border border-[rgb(var(--color-brand-ink-rgb)/0.08)] bg-white p-4 text-right shadow-[0_8px_24px_rgb(var(--color-brand-ink-rgb)/0.04)] transition hover:-translate-y-0.5 hover:border-[rgb(var(--color-brand-gold-rgb)/0.35)] hover:shadow-[0_14px_34px_rgb(var(--color-brand-ink-rgb)/0.075)] sm:gap-4 sm:p-5"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${presentation.iconClassName}`}>
        <NotificationIcon kind={presentation.kind} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-black text-[var(--color-brand-ink)] sm:text-base">{notification.title}</span>
          <span className="rounded-full bg-[var(--color-brand-paper)] px-2.5 py-1 text-[10px] font-black text-[var(--color-brand-stone)]">
            {presentation.label}
          </span>
        </span>

        {body ? <span className="mt-2 block text-sm font-semibold leading-7 text-[var(--color-brand-stone-dark)]">{body}</span> : null}

        <span className="mt-3 inline-flex items-center rounded-lg bg-[var(--color-brand-paper-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-brand-stone-muted)]">
          {formatNotificationDate(notification.createdAt)}
        </span>
      </span>

      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--color-brand-ink-rgb)/0.08)] text-[var(--color-brand-stone)] transition group-hover:border-[rgb(var(--color-brand-gold-rgb)/0.3)] group-hover:bg-[var(--color-brand-paper)] group-hover:text-[var(--color-brand-ink)]">
        <ChevronIcon />
      </span>
    </button>
  )
}
