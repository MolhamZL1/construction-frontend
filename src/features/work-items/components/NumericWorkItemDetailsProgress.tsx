import type { WorkItem } from '../models/work-item.model'
import { getWorkItemProgressCounters } from '../utils/work-item-progress-counters'

interface NumericWorkItemDetailsProgressProps {
  item: WorkItem
}

function formatCount(value: number) {
  return Number.isFinite(value) ? value.toLocaleString('ar') : '0'
}

export function NumericWorkItemDetailsProgress({ item }: NumericWorkItemDetailsProgressProps) {
  const counters = getWorkItemProgressCounters(item)
  if (counters.length === 0) return null

  const completed = counters.reduce((total, counter) => total + counter.completed, 0)
  const total = counters.reduce((sum, counter) => sum + counter.total, 0)
  const percent = total > 0 ? Math.round((completed / total) * 100) : Math.round(item.progressPercent || 0)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div>
          <p className="text-xs font-black text-[var(--color-brand-ink)]">ملخص الإنجاز العددي</p>
          <h2 className="mt-1 text-lg font-black text-slate-900">الأعداد المطلوبة لهذا البند</h2>
        </div>

        <div className="rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] px-5 py-3 text-center text-[var(--color-brand-ink)]">
          <p className="text-2xl font-black">{formatCount(percent)}%</p>
          <p className="text-xs font-black">نسبة الإنجاز</p>
        </div>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-3">
        {counters.map((counter) => (
          <article key={counter.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-sm font-black text-slate-900">{counter.label}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white px-2 py-3 ring-1 ring-slate-100">
                <p className="text-[11px] font-bold text-slate-400">المنجز</p>
                <p className="mt-1 text-lg font-black text-[var(--color-brand-ink)]">{formatCount(counter.completed)}</p>
              </div>

              <div className="rounded-xl bg-white px-2 py-3 ring-1 ring-slate-100">
                <p className="text-[11px] font-bold text-slate-400">الكلي</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatCount(counter.total)}</p>
              </div>

              <div className="rounded-xl bg-white px-2 py-3 ring-1 ring-slate-100">
                <p className="text-[11px] font-bold text-slate-400">المتبقي</p>
                <p className="mt-1 text-lg font-black text-amber-600">{formatCount(counter.remaining)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
