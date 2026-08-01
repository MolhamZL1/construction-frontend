import type { DashboardDeliveryPerformance } from '../models/dashboard-overview.model'
import { DashboardIcon } from './DashboardIcon'

interface OnTimeDeliveryChartProps {
  data: DashboardDeliveryPerformance
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
}

export function OnTimeDeliveryChart({ data }: OnTimeDeliveryChartProps) {
  const percentage = clampPercentage(data.onTimePercentage)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <DashboardIcon name="calendar" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">نسبة التسليم في الموعد</h2>
  </div>
        </div>
      </header>

      <div className="flex flex-col items-center px-5 py-6">
        <div className="relative h-48 w-48" dir="ltr">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="11"
              className="text-slate-100"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="11"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={`${percentage} ${100 - percentage}`}
              className="text-emerald-500 transition-all duration-700"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black tracking-tight text-slate-950" dir="ltr">{percentage}%</span>
            <span className="mt-1 text-xs font-black text-emerald-600">ضمن الموعد</span>
          </div>
        </div>

        

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-emerald-700">في الموعد</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <strong className="mt-2 block text-2xl font-black tabular-nums text-emerald-800">{data.onTimeProjects}</strong>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-rose-700">بعد الموعد</span>
              <span className="h-2 w-2 rounded-full bg-rose-500" />
            </div>
            <strong className="mt-2 block text-2xl font-black tabular-nums text-rose-800">{data.delayedProjects}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
