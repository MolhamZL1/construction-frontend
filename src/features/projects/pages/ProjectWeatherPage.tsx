import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon, type ProjectDetailIconName } from '../components/project-detail/ProjectDetailIcons'
import { ProjectWeatherOverviewCard } from '../components/project-detail/ProjectWeatherOverviewCard'
import { useProjectSummary, useProjectWeather, useProjectWeatherByDate } from '../hooks/useProjects'
import type { ProjectWeatherByDate } from '../models/project.model'
import { formatProjectDate } from '../utils/projects-formatters'

function getTodayInputValue() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatNumber(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return Number(value).toFixed(digits)
}

export function ProjectWeatherPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue)

  const summaryQuery = useProjectSummary(id)
  const todayWeatherQuery = useProjectWeather(id)
  const dateWeatherQuery = useProjectWeatherByDate(id, selectedDate)

  const project = summaryQuery.data?.project
  const weatherResult = dateWeatherQuery.data

  const weatherCards = useMemo(
    () => buildWeatherCards(weatherResult),
    [weatherResult]
  )

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              العودة إلى تفاصيل المشروع
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold text-slate-900">طقس المشروع</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">عرض حالة الطقس الحالية والبحث عن طقس المشروع بتاريخ محدد: {project.name}</p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 text-cyan-600">
            <ProjectDetailIcon name="cloud" className="h-9 w-9" />
          </div>
        </div>

        <ProjectWeatherOverviewCard
          projectId={id}
          weather={todayWeatherQuery.data}
          isLoading={todayWeatherQuery.isLoading}
          isError={todayWeatherQuery.isError}
        />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">البحث بتاريخ محدد</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">اختر التاريخ وسيتم جلب التوقعات من API الخاص بالطقس اليومي للمشروع.</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="space-y-2 text-right">
                <span className="text-xs font-bold text-slate-500">التاريخ</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-12 min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </label>
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayInputValue())}
                className="mt-auto inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:border-cyan-200 hover:text-cyan-600"
              >
                اليوم
              </button>
            </div>
          </div>

          <div className="mt-6">
            {dateWeatherQuery.isLoading ? (
              <LoadingState label="جاري تحميل طقس التاريخ المحدد..." />
            ) : dateWeatherQuery.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
                تعذر تحميل الطقس لهذا التاريخ. تحقق من التاريخ أو حاول لاحقاً.
              </div>
            ) : weatherResult ? (
              <SelectedDateWeather weather={weatherResult} cards={weatherCards} />
            ) : null}
          </div>
        </section>
      </div>
    </section>
  )
}

interface WeatherCardData {
  key: string
  label: string
  value: string
  icon: ProjectDetailIconName
}

function buildWeatherCards(weatherResult?: ProjectWeatherByDate): WeatherCardData[] {
  const weather = weatherResult?.weather

  return [
    { key: 'max', label: 'درجة الحرارة العظمى', value: `${formatNumber(weather?.temperatureMax)} °C`, icon: 'temperature' },
    { key: 'min', label: 'درجة الحرارة الصغرى', value: `${formatNumber(weather?.temperatureMin)} °C`, icon: 'temperature' },
    { key: 'rain', label: 'إجمالي الهطول', value: `${formatNumber(weather?.precipitationSum)} مم`, icon: 'rain' },
    { key: 'wind', label: 'أقصى سرعة رياح', value: `${formatNumber(weather?.windSpeedMax)} كم/س`, icon: 'wind' },
  ]
}

function SelectedDateWeather({ weather, cards }: { weather: ProjectWeatherByDate; cards: WeatherCardData[] }) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-cyan-600 shadow-sm">
              <ProjectDetailIcon name="sun" className="h-9 w-9" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-cyan-700">{formatProjectDate(weather.weather.date)}</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{weather.weather.weatherDescription || 'طقس المشروع'}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{weather.project.location}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white px-5 py-3 text-left shadow-sm" dir="ltr">
            <span className="text-3xl font-black text-slate-900">{formatNumber(weather.weather.temperatureMax)}</span>
            <span className="align-top text-sm font-extrabold text-slate-500">°C</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-2xl font-black text-slate-600">{formatNumber(weather.weather.temperatureMin)}</span>
            <span className="align-top text-sm font-extrabold text-slate-400">°C</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_28px_rgb(var(--color-brand-ink-rgb)/0.05)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <ProjectDetailIcon name={card.icon} className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-400">{card.label}</p>
            <p className="mt-2 text-xl font-extrabold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
