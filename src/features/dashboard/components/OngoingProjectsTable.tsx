import { formatUsdCompactCurrency, formatUsdCurrency } from '@/utils/currency'

import type {
  DashboardOngoingProject,
  DashboardProjectHealthStatus,
} from '../models/dashboard-overview.model'
import { DashboardIcon } from './DashboardIcon'

interface OngoingProjectsTableProps {
  projects: DashboardOngoingProject[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

const statusDetails: Record<DashboardProjectHealthStatus, { label: string; className: string }> = {
  normal: {
    label: 'طبيعي',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  delayed: {
    label: 'متأخر',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  over_budget: {
    label: 'تجاوز الميزانية',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
}

function RemainingDays({ value }: { value: number }) {
  const isOverdue = value < 0

  return (
    <span className={`inline-flex items-center gap-2 text-xs font-black ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>
      <DashboardIcon name="clock" className={`h-4 w-4 ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`} />
      {isOverdue ? (
        <>
          <span>متأخر</span>
          <span className="tabular-nums">{Math.abs(value)}</span>
          <span className="text-rose-400">يوم</span>
        </>
      ) : (
        <>
          <span className="tabular-nums">{value}</span>
          <span className="text-slate-400">يوم</span>
        </>
      )}
    </span>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3 px-5 py-5 sm:px-6" aria-label="جاري تحميل المشاريع">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid min-w-[760px] grid-cols-[1.45fr_1fr_.7fr_.8fr_.8fr_.8fr] items-center gap-4 rounded-2xl border border-slate-100 px-4 py-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

export function OngoingProjectsTable({
  projects,
  isLoading = false,
  isError = false,
  onRetry,
}: OngoingProjectsTableProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-ink-rgb)/0.09)] text-[var(--color-brand-ink)]">
            <DashboardIcon name="progress" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">المشاريع قيد التنفيذ</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">متابعة التقدم والمدة والتكلفة الحالية لكل مشروع</p>
          </div>
        </div>

        {!isLoading && !isError ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
            {projects.length} {projects.length === 1 ? 'مشروع' : 'مشاريع'}
          </span>
        ) : null}
      </header>

      {isLoading ? <LoadingRows /> : null}

      {!isLoading && isError ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <DashboardIcon name="refresh" className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-base font-black text-slate-800">تعذر تحميل المشاريع</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">تحقق من الاتصال بالخادم ثم حاول مرة أخرى.</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-4 py-2.5 text-xs font-black text-white transition hover:opacity-90"
            >
              <DashboardIcon name="refresh" className="h-4 w-4" />
              إعادة المحاولة
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && projects.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <DashboardIcon name="project" className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-base font-black text-slate-800">لا توجد مشاريع قيد التنفيذ</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">ستظهر المشاريع هنا عند وجود مشاريع جارية.</p>
        </div>
      ) : null}

      {!isLoading && !isError && projects.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-right">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-black text-slate-500">
                <th className="px-6 py-3.5">اسم المشروع</th>
                <th className="px-4 py-3.5">نسبة الإنجاز</th>
                <th className="px-4 py-3.5">الأيام المتبقية</th>
                <th className="px-4 py-3.5">التكلفة الحالية</th>
                <th className="px-4 py-3.5">القيمة المقدرة</th>
                <th className="px-6 py-3.5">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => {
                const progress = clampPercentage(project.progressPercentage)
                const status = statusDetails[project.status]

                return (
                  <tr key={project.id} className="group transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)] transition group-hover:scale-105">
                          <DashboardIcon name="project" className="h-[18px] w-[18px]" />
                        </span>
                        <span className="font-black text-slate-800">{project.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex min-w-[150px] items-center gap-3" dir="ltr">
                        <span className="w-9 text-left text-xs font-black tabular-nums text-slate-700">{progress}%</span>
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <span
                            className="block h-full rounded-full bg-[var(--color-brand-ink)] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <RemainingDays value={project.remainingDays} />
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className="block text-sm font-black tabular-nums text-slate-800"
                        dir="ltr"
                        title={formatUsdCurrency(project.currentCost)}
                      >
                        {formatUsdCompactCurrency(project.currentCost)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className="block text-sm font-black tabular-nums text-slate-600"
                        dir="ltr"
                        title={formatUsdCurrency(project.estimatedValue)}
                      >
                        {formatUsdCompactCurrency(project.estimatedValue)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${status.className}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
