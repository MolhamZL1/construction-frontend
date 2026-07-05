import type { DurationExtensionStatus } from '../../models/duration-extension.model'

const statusLabels: Record<string, string> = {
  pending: 'معلّق',
  approved: 'مقبول',
  rejected: 'مرفوض',
}

const statusClasses: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
}

export function DurationExtensionStatusBadge({ status }: { status: DurationExtensionStatus }) {
  const normalizedStatus = String(status || 'pending').toLowerCase()

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClasses[normalizedStatus] ?? 'bg-slate-50 text-slate-600 ring-slate-100'}`}
    >
      {statusLabels[normalizedStatus] ?? status}
    </span>
  )
}
