import { NotificationIcon } from '../NotificationIcon'

export function NotificationsLoadingState() {
  return (
    <div className="space-y-3" aria-label="جاري تحميل الإشعارات">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[1.4rem] border border-[rgb(var(--color-brand-ink-rgb)/0.06)] bg-white p-5">
          <div className="flex gap-4">
            <div className="h-11 w-11 rounded-2xl bg-[var(--color-brand-paper)]" />
            <div className="flex-1">
              <div className="h-4 w-2/5 rounded bg-[var(--color-brand-paper-muted)]" />
              <div className="mt-3 h-3 w-4/5 rounded bg-[var(--color-brand-paper-soft)]" />
              <div className="mt-2 h-3 w-1/3 rounded bg-[var(--color-brand-paper-soft)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function NotificationsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-8 text-center">
      <p className="text-sm font-black text-rose-700">تعذر تحميل الإشعارات</p>
      <p className="mt-2 text-xs font-semibold text-rose-600/80">تحقق من الاتصال وحاول مرة أخرى.</p>
      <button type="button" onClick={onRetry} className="mt-5 h-10 rounded-xl bg-rose-600 px-4 text-xs font-black text-white transition hover:bg-rose-700">
        إعادة المحاولة
      </button>
    </div>
  )
}

export function NotificationsEmptyState({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[rgb(var(--color-brand-ink-rgb)/0.12)] bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-paper)] text-[var(--color-brand-stone)]">
        <NotificationIcon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-black text-[var(--color-brand-ink)]">{filtered ? 'لا توجد إشعارات ضمن هذا التصنيف' : 'لا توجد إشعارات حالياً'}</p>
      <p className="mt-2 text-xs font-semibold text-[var(--color-brand-stone)]">{filtered ? 'حاول اختيار تصنيف آخر.' : 'ستظهر تحديثات المشاريع والطلبات الجديدة هنا.'}</p>
    </div>
  )
}
