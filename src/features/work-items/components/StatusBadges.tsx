import { getWorkItemQualityLabel, getWorkItemStatusLabel } from '../constants/work-items'
import type { WorkItemQualityLevel, WorkItemStatus } from '../models/work-item.model'

export function WorkItemStatusBadge({ status }: { status: WorkItemStatus }) {
  const className =
    status === 'completed'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'ongoing'
        ? 'bg-cyan-50 text-cyan-700'
        : 'bg-amber-50 text-amber-700'

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${className}`}>{getWorkItemStatusLabel(status)}</span>
}

export function WorkItemQualityBadge({ quality }: { quality: WorkItemQualityLevel }) {
  return <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">{getWorkItemQualityLabel(quality)}</span>
}
