interface NotificationsPageHeaderProps {
  isRefreshing: boolean
  onBack: () => void
  onRefresh: () => void
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M20 12a8 8 0 0 1-13.7 5.7M4 12A8 8 0 0 1 17.7 6.3M18 3v4h-4M6 21v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NotificationsPageHeader({ isRefreshing, onBack, onRefresh }: NotificationsPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-[rgb(var(--color-brand-ink-rgb)/0.08)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-brand-ink)]">الإشعارات</h1>
     
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--color-brand-ink-rgb)/0.1)] bg-white px-4 text-sm font-black text-[var(--color-brand-ink)] shadow-sm transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.35)] hover:bg-[var(--color-brand-paper)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshIcon spinning={isRefreshing} />
          تحديث
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-4 text-sm font-black text-white shadow-[0_10px_22px_rgb(var(--color-brand-ink-rgb)/0.16)] transition hover:bg-[var(--color-brand-ink-soft)]"
        >
          <ArrowIcon />
          رجوع
        </button>
      </div>
    </header>
  )
}
