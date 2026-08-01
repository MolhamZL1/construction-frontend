import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../models/project.model'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { clampProgressPercent, formatMeasurement, formatProjectDate } from '../utils/projects-formatters'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const progressPercent = clampProgressPercent(project.progressPercent)

  return (
    <article className="relative flex min-h-[265px] flex-col overflow-visible rounded-2xl border border-slate-200 bg-white text-right shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgb(var(--color-brand-ink-rgb)/0.12)]">
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <ProjectActionsMenu projectId={project.id} isOpen={isMenuOpen} onToggle={() => setIsMenuOpen((value) => !value)} onClose={() => setIsMenuOpen(false)} />

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
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

function ProjectActionsMenu({ projectId, isOpen, onToggle, onClose }: ProjectActionsMenuProps) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        aria-label="إجراءات المشروع"
        aria-expanded={isOpen}
      >
        <Icon name="dots" className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-11 z-20 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-600 shadow-[0_18px_40px_rgb(var(--color-brand-ink-rgb)/0.18)]">
          <MenuLink to={`/projects/${projectId}`} icon="eye" label="عرض التفاصيل" onClick={onClose} />
          <MenuLink to={`/projects/${projectId}`} icon="edit" label="تعديل" onClick={onClose} />
          <MenuLink to={`/projects/${projectId}/team`} icon="users" label="فريق العمل" onClick={onClose} />
          <MenuLink to={`/projects/${projectId}`} icon="home" label="الفراغات" onClick={onClose} />
          <MenuLink to={`/projects/${projectId}`} icon="checklist" label="بنود العمل" onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-right text-rose-500 transition hover:bg-rose-50"
          >
            <Icon name="trash" className="h-4 w-4" />
            حذف
          </button>
        </div>
      ) : null}
    </div>
  )
}

interface MenuLinkProps {
  to: string
  icon: IconName
  label: string
  onClick: () => void
}

function MenuLink({ to, icon, label, onClick }: MenuLinkProps) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)]">
      <Icon name={icon} className="h-4 w-4" />
      {label}
    </Link>
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

type IconName =
  | 'area'
  | 'calendar'
  | 'checklist'
  | 'dots'
  | 'edit'
  | 'eye'
  | 'height'
  | 'home'
  | 'location'
  | 'progress'
  | 'trash'
  | 'users'

function Icon({ name, className }: { name: IconName; className?: string }) {
  if (name === 'dots') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5.5h.01M12 12h.01M12 18.5h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

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

  if (name === 'eye') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    )
  }

  if (name === 'edit') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3.5 20a5.5 5.5 0 0 1 11 0M17 9a3 3 0 1 0 0-6M16 14a4.5 4.5 0 0 1 4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'home') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 11.5 12 4l8 7.5V20h-5v-5H9v5H4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'checklist') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 7h10M9 12h10M9 17h10M4.5 7l1 1 2-2M4.5 12l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 7h12M9 7V5h6v2M9 10v7M15 10v7M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
