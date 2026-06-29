import type { WorkItem } from '../models/work-item.model'
import { formatWorkItemDate, getExpectedFinishDate, isWorkItemLate } from '../utils/work-items-formatters'
import { WorkItemIcon } from './WorkItemIcon'

interface DelayAndWeatherCardProps {
  item: WorkItem
}

export function DelayAndWeatherCard({ item }: DelayAndWeatherCardProps) {
  const late = isWorkItemLate(item)
  const expectedFinishDate = getExpectedFinishDate(item)
  const delayInfo = item.delayInfo

  if (!late && !delayInfo) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <WorkItemIcon name="info" className="h-5 w-5 text-[#50683f]" />
          <h2 className="text-xl font-black text-slate-900">التأخير والطقس</h2>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-500">لا يوجد تأخير مسجل على هذا البند حالياً.</p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-amber-100 bg-amber-50/50 p-5 text-right shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <WorkItemIcon name="warning" className="h-5 w-5 text-amber-600" />
        <h2 className="text-xl font-black text-slate-900">التأخير والطقس</h2>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-black text-slate-400">موعد الإنهاء المتوقع</p>
          <p className="mt-1 text-sm font-black text-slate-800">{expectedFinishDate ? formatWorkItemDate(expectedFinishDate.toISOString()) : 'غير محدد'}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-black text-slate-400">سبب التأخير</p>
          <p className="mt-1 text-sm font-black text-slate-800">{delayInfo?.reason ?? 'سيُطلب سبب التأخير عند إنهاء البند.'}</p>
        </div>
      </div>

      {delayInfo?.weatherDescription ? (
        <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-black text-slate-400">طقس يوم التأخير</p>
          <p className="mt-1 text-sm font-black text-slate-800">
            {delayInfo.weatherDescription} • {delayInfo.temperatureMin ?? '—'}° / {delayInfo.temperatureMax ?? '—'}°
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-amber-200 bg-white/70 px-4 py-3 text-sm font-bold text-amber-700">
          عند إضافة API سبب التأخير والطقس سيتم عرض الطقس المسجل في يوم التأخير هنا.
        </div>
      )}
    </section>
  )
}
