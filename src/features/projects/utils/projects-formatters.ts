import type { Project, ProjectStatus } from '../models/project.model'

export const projectStatusMeta: Record<
  ProjectStatus,
  {
    label: string
    badgeClassName: string
    dotClassName: string
    summaryDotClassName: string
  }
> = {
  planned: {
    label: 'مخطط',
    badgeClassName: 'bg-amber-50 text-amber-500',
    dotClassName: 'bg-amber-400',
    summaryDotClassName: 'bg-amber-400',
  },
  ongoing: {
    label: 'جاري التنفيذ',
    badgeClassName: 'bg-cyan-50 text-cyan-600',
    dotClassName: 'bg-cyan-500',
    summaryDotClassName: 'bg-cyan-500',
  },
  completed: {
    label: 'مكتمل',
    badgeClassName: 'bg-emerald-50 text-emerald-600',
    dotClassName: 'bg-emerald-500',
    summaryDotClassName: 'bg-emerald-500',
  },
}

export function clampProgressPercent(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

export function formatMeasurement(value?: string | number | null, fractionDigits = 2) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return String(value)
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numericValue)
}

export function formatProjectDate(value?: string | null) {
  if (!value) {
    return 'غير محدد'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'غير محدد'
  }

  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function projectMatchesSearch(project: Project, search: string) {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return [project.name, project.location, project.apartmentArea, project.height]
    .filter(Boolean)
    .some((value) => value.toString().toLowerCase().includes(normalizedSearch))
}
