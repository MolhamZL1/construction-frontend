import type { ComponentProps } from 'react'
import { getWorkItemQualityLabel } from '../constants/work-items'
import type { WorkItem } from '../models/work-item.model'
import { formatWorkItemDate, getExpectedFinishDate, isWorkItemLate } from '../utils/work-items-formatters'
import { WorkItemStatusBadge } from './StatusBadges'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemSpecCardProps {
  item: WorkItem
}

export function WorkItemSpecCard({ item }: WorkItemSpecCardProps) {
  const late = isWorkItemLate(item)
  const expectedFinishDate = getExpectedFinishDate(item)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{item.name}</h1>
            <WorkItemStatusBadge status={item.status} />
            {late ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">متأخر</span> : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-500">تفاصيل البند، حالته، مستوى التنفيذ، والإنجاز الحالي.</p>
        </div>

        <div className="rounded-2xl bg-[#50683f]/10 px-5 py-3 text-center text-[#50683f]">
          <p className="text-2xl font-black">{Math.round(item.progressPercent)}%</p>
          <p className="text-xs font-black">إنجاز البند</p>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#50683f] transition-all" style={{ width: `${Math.round(item.progressPercent)}%` }} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SpecBox icon="reorder" label="الترتيب" value={item.sortOrder} />
        <SpecBox icon="clock" label="المدة المتوقعة" value={item.durationDays ? `${item.durationDays} يوم` : 'غير محددة'} />
        <SpecBox icon="check" label="مستوى التنفيذ" value={getWorkItemQualityLabel(item.qualityLevel)} />
        <SpecBox icon="info" label="حالة التفعيل" value={item.isActive ? 'مفعل' : 'غير مفعل'} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <DateBox label="تاريخ البدء" value={formatWorkItemDate(item.startedAt)} />
        <DateBox label="موعد الإنهاء المتوقع" value={expectedFinishDate ? formatWorkItemDate(expectedFinishDate.toISOString()) : 'غير محدد'} />
        <DateBox label="تاريخ الإنهاء" value={formatWorkItemDate(item.completedAt)} />
      </div>

      {item.details.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <h3 className="mb-3 text-sm font-black text-slate-800">تفاصيل إضافية</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {item.details.map((detail) => (
              <div key={`${detail.key}-${detail.value}`} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600">
                {detail.key}: <span className="text-slate-900">{String(detail.value)} {detail.unit ?? ''}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function SpecBox({ icon, label, value }: { icon: ComponentProps<typeof WorkItemIcon>['name']; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400"><WorkItemIcon name={icon} className="h-4 w-4" /><span className="text-xs font-black">{label}</span></div>
      <p className="mt-2 text-base font-black text-slate-900">{value}</p>
    </div>
  )
}

function DateBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}
