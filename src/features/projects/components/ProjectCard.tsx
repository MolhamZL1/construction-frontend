import { Link, useNavigate } from 'react-router-dom'
import type { Project } from '../models/project.model'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { clampProgressPercent, formatMeasurement, formatProjectDate } from '../utils/projects-formatters'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progressPercent = clampProgressPercent(project.progressPercent)

  return (
    <article className="relative flex min-h-[265px] flex-col overflow-visible rounded-2xl border border-slate-200 bg-white text-right shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgb(var(--color-brand-ink-rgb)/0.12)]">
      <div className="relative flex items-start justify-between gap-3 px-4 pb-4 pl-16 pt-5 sm:px-5 sm:pl-5">
        <ProjectActionsMenu projectId={project.id} />

        <div className="min-w-0 flex-1 pt-1">
          <Link to={`/projects/${project.id}`} className="block text-lg font-extrabold leading-8 text-slate-900 transition hover:text-[var(--color-brand-ink)]">
            <span className="line-clamp-2">{project.name}</span>
          </Link>
          <div className="mt-3">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-4">
        <InfoLine icon="location" value={project.location} />

        <div className="mt-4 grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 border-y border-slate-100 py-3">
          <MetricItem icon="area" label="المساحة" value={`${formatMeasurement(project.apartmentArea)} م²`} />
          <MetricItem icon="height" label="الارتفاع" value={`${formatMeasurement(project.height)} م`} />
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="progress" className="h-4 w-4 text-slate-400" />
              نسبة الإنجاز
            </span>
            <span dir="ltr" className="text-sm font-extrabold text-[var(--color-brand-ink)]">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" dir="ltr">
            <div className="h-full rounded-full bg-[var(--color-brand-ink)] transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>


      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-400">
        <Icon name="calendar" className="h-4 w-4 text-slate-400" />
        <span>تاريخ الإنشاء: {formatProjectDate(project.createdAt)}</span>
      </div>
    </article>
  )
}


interface ProjectActionsMenuProps {
  projectId: string
}

function ProjectActionsMenu({ projectId }: ProjectActionsMenuProps) {
  const navigate = useNavigate()

  return (
    <select
      value=""
      onChange={(event) => {
        const to = event.target.value
        if (to) navigate(to)
      }}
      aria-label="إجراءات المشروع"
      className="absolute left-3 top-3 z-40 h-10 w-10 shrink-0 cursor-pointer appearance-none rounded-xl border-0 bg-white text-center text-base font-black leading-none text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ink)] sm:relative sm:left-auto sm:top-auto sm:z-auto sm:h-9 sm:w-9 sm:bg-transparent sm:shadow-none sm:ring-0"
    >
      <option value="" disabled hidden>
        ⋯
      </option>
      <option value={`/projects/${projectId}`}>عرض التفاصيل</option>
      <option value={`/projects/${projectId}/edit`}>تعديل</option>
      <option value={`/projects/${projectId}/team`}>فريق العمل</option>
      <option value={`/projects/${projectId}/spaces`}>الفراغات</option>
      <option value={`/projects/${projectId}/work-items`}>بنود العمل</option>
    </select>
  )
}

interface InfoLineProps {
  icon: IconName
  value: string
}

function InfoLine({ icon, value }: InfoLineProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
      <Icon name={icon} className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="line-clamp-1">{value}</span>
    </div>
  )
}

interface MetricItemProps {
  icon: IconName
  label: string
  value: string
}

function MetricItem({ icon, label, value }: MetricItemProps) {
  return (
    <div className="flex items-center justify-center gap-3 px-3 first:pr-0 last:pl-0">
      <Icon name={icon} className="h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-extrabold text-slate-900" dir="ltr">
          {value}
        </p>
      </div>
    </div>
  )
}

type IconName = 'area' | 'calendar' | 'height' | 'location' | 'progress' | 'trash'

function Icon({ name, className }: { name: IconName; className?: string }) {
  if (name === 'location') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.4" />
      </svg>
    )
  }

  if (name === 'area') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19V5h14v14H5Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8h8v8H8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'height') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'progress') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19V9M11 19V5M17 19v-7" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 7h12M9 7V5h6v2M9 10v7M15 10v7M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
