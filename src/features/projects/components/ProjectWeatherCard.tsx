import { getProjectsErrorMessage } from '../hooks/useProjects'
import type { ProjectWeather } from '../models/project.model'

interface ProjectWeatherCardProps {
  weather?: ProjectWeather
  isLoading: boolean
  error?: unknown
}

function getHeatSummary(temperature?: number | null) {
  if (temperature == null) return { label: 'الحرارة غير متوفرة', tone: 'bg-slate-100 text-slate-600' }
  if (temperature >= 30) return { label: 'الجو حار', tone: 'bg-rose-50 text-  rose-700' }
  if (temperature >= 24) return { label: 'الجو دافئ', tone: 'bg-amber-50 text-amber-700' }
  if (temperature >= 16) return { label: 'الجو معتدل', tone: 'bg-emerald-50 text-emerald-700' }
  return { label: 'الجو بارد', tone: 'bg-sky-50 text-sky-700' }
}

function getRainSummary(precipitation?: number | null) {
  if (precipitation == null) return { label: 'غير معروف', tone: 'bg-slate-100 text-slate-600' }
  if (precipitation <= 0) return { label: 'لا يوجد مطر متوقع', tone: 'bg-emerald-50 text-emerald-700' }
  if (precipitation < 2) return { label: 'احتمال خفيف', tone: 'bg-sky-50 text-sky-700' }
  if (precipitation < 8) return { label: 'احتمال متوسط', tone: 'bg-amber-50 text-amber-700' }
  return { label: 'احتمال عالي', tone: 'bg-rose-50 text-rose-700' }
}

function formatTemperature(value?: number | null) {
  return value == null ? '—' : `${Math.round(value)}°`
}

export function ProjectWeatherCard({ weather, isLoading, error }: ProjectWeatherCardProps) {
  const current = weather?.currentWeather
  const forecast = weather?.todayForecast
  const heat = getHeatSummary(current?.temperature)
  const rain = getRainSummary(forecast?.precipitationSum)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">طقس المشروع</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-4xl font-bold leading-none text-slate-900" dir="ltr">
              {isLoading ? '...' : formatTemperature(current?.temperature)}
            </p>
            <span className={`mb-1 rounded-full px-3 py-1 text-xs font-semibold ${heat.tone}`}>
              {isLoading ? 'جاري التحميل' : heat.label}
            </span>
          </div>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#50683f]/10 text-[#50683f]">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
            <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64" />
          </svg>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">احتمال هطول المطر</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rain.tone}`}>
            {isLoading ? 'جاري التحميل' : rain.label}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getProjectsErrorMessage(error)}
        </div>
      ) : null}
    </section>
  )
}
