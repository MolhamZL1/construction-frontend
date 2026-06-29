import { Link } from 'react-router-dom'
import { ProjectDetailIcon, type ProjectDetailIconName } from './ProjectDetailIcons'
import { projectDetailAccentClasses, type ProjectDetailAccent } from './project-detail-theme'

interface ProjectDetailSectionCardProps {
  title: string
  description: string
  icon: ProjectDetailIconName
  accent: ProjectDetailAccent
  to?: string
  badge?: string
}

export function ProjectDetailSectionCard({ title, description, icon, accent, to, badge }: ProjectDetailSectionCardProps) {
  const accentClasses = projectDetailAccentClasses[accent]
  const content = (
    <>
      <div className="flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accentClasses.iconBox}`}>
          <ProjectDetailIcon name={icon} className="h-7 w-7" />
        </span>
        <div className="min-w-0 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {badge ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">{badge}</span> : null}
            <h3 className="text-lg font-extrabold leading-7 text-slate-900">{title}</h3>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
        </div>
      </div>
      <span className="mr-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition group-hover:bg-slate-50 group-hover:text-[#50683f]">
        <ProjectDetailIcon name="arrow" className="h-5 w-5" />
      </span>
    </>
  )

  const className = `group flex min-h-[112px] items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] ${accentClasses.border}`

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
