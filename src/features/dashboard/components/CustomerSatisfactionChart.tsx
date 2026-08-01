import type { DashboardCustomerSatisfaction } from '../models/dashboard.model'
import { DashboardIcon } from './DashboardIcon'

interface CustomerSatisfactionChartProps {
  data?: DashboardCustomerSatisfaction
  isLoading: boolean
  isError: boolean
}

function satisfactionLabel(value: number) {
  if (value >= 4.5) return 'رضا ممتاز'
  if (value >= 4) return 'رضا مرتفع'
  if (value >= 3) return 'رضا جيد'
  if (value >= 2) return 'رضا مقبول'
  if (value > 0) return 'يحتاج متابعة'
  return 'لا توجد تقييمات'
}

export function CustomerSatisfactionChart({ data, isLoading, isError }: CustomerSatisfactionChartProps) {
  if (isLoading) return <CustomerSatisfactionSkeleton />

  if (isError) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-[0_12px_35px_rgb(var(--color-brand-ink-rgb)/0.05)]">
        <h2 className="text-base font-black text-slate-950">رضا العملاء</h2>
        <p className="mt-3 text-sm font-bold text-rose-600">تعذر تحميل تقييمات المشاريع حالياً.</p>
      </section>
    )
  }

  const average = Math.max(0, Math.min(5, data?.averageRating ?? 0))
  const reviews = data?.reviews ?? []
  const total = data?.totalReviews ?? reviews.length
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Math.round(review.rating) === rating).length,
  }))
  const maxCount = Math.max(1, ...distribution.map((item) => item.count))
  const circlePercent = (average / 5) * 100
  const topProjects = (data?.ranking ?? []).slice(0, 3)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <DashboardIcon name="chart" />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-950">رضا العملاء</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">مبني على تقييمات ملاك المشاريع المكتملة</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
          {total} تقييم
        </span>
      </header>

      {total === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-400">
            <DashboardIcon name="star" className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-base font-black text-slate-800">ما في تقييمات كافية بعد</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">المخطط بيتحدث تلقائياً بعد وصول تقييمات المشاريع.</p>
        </div>
      ) : (
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[240px_minmax(0,1fr)_260px]">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50 px-4 py-5 text-center">
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(var(--color-brand-ink) ${circlePercent}%, var(--color-neutral300) 0)` }}
            >
              <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-3xl font-black tracking-tight text-slate-950" dir="ltr">{average.toFixed(1)}</span>
                <span className="mt-1 text-xs font-black text-slate-400">من 5</span>
              </div>
            </div>
            <p className="mt-4 text-sm font-black text-[var(--color-brand-ink)]">{satisfactionLabel(average)}</p>
            <div className="mt-3 flex items-center gap-1 text-amber-400" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <DashboardIcon
                  key={star}
                  name="star"
                  className={`h-4 w-4 ${star <= Math.round(average) ? 'text-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-800">توزيع التقييمات</h3>
              <span className="text-xs font-bold text-slate-400">عدد المشاريع</span>
            </div>
            <div className="space-y-4">
              {distribution.map((item) => {
                const width = item.count === 0 ? 0 : Math.max(8, (item.count / maxCount) * 100)

                return (
                  <div key={item.rating} className="grid grid-cols-[46px_minmax(0,1fr)_28px] items-center gap-3">
                    <span className="flex items-center gap-1 text-xs font-black text-slate-600" dir="ltr">
                      {item.rating}
                      <DashboardIcon name="star" className="h-3.5 w-3.5 text-amber-400" />
                    </span>
                    <span className="h-3 overflow-hidden rounded-full bg-slate-100" dir="ltr">
                      <span
                        className="block h-full rounded-full bg-[var(--color-brand-ink)] transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </span>
                    <span className="text-center text-xs font-black text-slate-500">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <h3 className="text-sm font-black text-slate-800">الأعلى تقييماً</h3>
            <div className="mt-4 space-y-3">
              {topProjects.map((review, index) => (
                <div key={`${review.project.id}-${review.rank ?? index}`} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {review.rank ?? index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs font-black text-slate-800">{review.project.name}</strong>
                    <span className="mt-1 block truncate text-[11px] font-bold text-slate-400">{review.owner?.name ?? 'مالك المشروع'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-black text-slate-700" dir="ltr">
                    {review.rating.toFixed(1)}
                    <DashboardIcon name="star" className="h-3.5 w-3.5 text-amber-400" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function CustomerSatisfactionSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="h-11 w-11 rounded-2xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-3 w-64 rounded bg-slate-100" />
        </div>
      </div>
      <div className="grid gap-6 px-5 py-6 lg:grid-cols-[240px_minmax(0,1fr)_260px]">
        <div className="mx-auto h-36 w-36 rounded-full bg-slate-200" />
        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-3 rounded-full bg-slate-100" />)}
        </div>
        <div className="h-52 rounded-3xl bg-slate-100" />
      </div>
    </div>
  )
}
