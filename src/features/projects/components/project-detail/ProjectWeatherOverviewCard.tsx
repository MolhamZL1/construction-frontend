import { Link } from 'react-router-dom'
import type { ProjectWeather } from '../../models/project.model'
import { ProjectDetailIcon } from './ProjectDetailIcons'

interface ProjectWeatherOverviewCardProps {
  projectId: string
  weather?: ProjectWeather
  isLoading?: boolean
  isError?: boolean
}

function formatNumber(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return Number(value).toFixed(digits)
}

function getWeatherIcon(weatherCode: number | null | undefined, description: string | undefined) {
  const normalizedDescription = description?.toLowerCase() ?? ''

  if (
    weatherCode === 0 ||
    weatherCode === 1 ||
    normalizedDescription.includes('clear') ||
    normalizedDescription.includes('sun')
  ) {
    return 'sun' as const
  }

  if (
    normalizedDescription.includes('rain') ||
    normalizedDescription.includes('shower') ||
    normalizedDescription.includes('snow') ||
    normalizedDescription.includes('precipitation') ||
    (typeof weatherCode === 'number' && weatherCode >= 50)
  ) {
    return 'rain' as const
  }

  return 'cloud' as const
}

export function ProjectWeatherOverviewCard({
  projectId,
  weather,
  isLoading = false,
  isError = false,
}: ProjectWeatherOverviewCardProps) {
  const currentWeather = weather?.currentWeather
  const description = isError
    ? 'تعذر تحميل الطقس'
    : currentWeather?.weatherDescription || 'طقس المشروع'

  const icon = getWeatherIcon(currentWeather?.weatherCode, description)
  const temperature = isLoading ? '...' : formatNumber(currentWeather?.temperature)

  return (
    <Link
      to={`/projects/${projectId}/weather`}
      className="group inline-flex w-full max-w-[280px] items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-right transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.25)] hover:bg-[rgb(var(--color-brand-gold-rgb)/0.05)]"
      aria-label="عرض تفاصيل طقس المشروع"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-brand-ink)] shadow-sm">
          <ProjectDetailIcon name={icon} className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-700">الطقس</p>
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
            {isLoading ? 'جاري التحميل...' : description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="text-left leading-none" dir="ltr">
          <span className="text-lg font-black text-slate-900">{temperature}</span>
          <span className="text-[10px] font-extrabold text-slate-500">°C</span>
        </div>

        <ProjectDetailIcon
          name="arrow"
          className="h-4 w-4 rotate-180 text-slate-400 transition group-hover:text-[var(--color-brand-ink)]"
        />
      </div>
    </Link>
  )
}