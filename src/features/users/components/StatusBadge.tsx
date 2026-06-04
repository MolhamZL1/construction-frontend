export function getStatusLabel(status?: string) {
  if (status === 'active') {
    return 'نشط'
  }

  if (status === 'inactive') {
    return 'غير نشط'
  }

  return '—'
}

export function StatusBadge({ status }: { status?: string }) {
  if (!status) {
    return <span className="text-slate-400">—</span>
  }

  const isActive = status === 'active'

  return (
    <span
      className={
        isActive
          ? 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600'
          : 'inline-flex rounded-full bg-[#FF5630]/10 px-3 py-1 text-xs font-semibold text-[#FF5630]'
      }
    >
      {getStatusLabel(status)}
    </span>
  )
}
