import { Link } from 'react-router-dom'
import { ProjectDetailIcon, type ProjectDetailIconName } from './ProjectDetailIcons'
import { projectDetailAccentClasses, type ProjectDetailAccent } from './project-detail-theme'

export interface ProjectDetailStatItem {
  key: string
  label: string
  description: string
  to?: string
  onClick?: () => void
  icon: ProjectDetailIconName
  accent: ProjectDetailAccent
  meta?: string
  isActive?: boolean
}

interface ProjectDetailStatsProps {
  items: ProjectDetailStatItem[]
}

export function ProjectDetailStats({ items }: ProjectDetailStatsProps) {
  return (
    <section className="space-y-4 text-right">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">أدوات المشروع</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">أدوات مختصرة لمتابعة التنفيذ والتقدير.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => {
          const accent = projectDetailAccentClasses[item.accent]
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent.iconBox}`}>
                  <ProjectDetailIcon name={item.icon} className="h-5 w-5" />
                </span>

                <ProjectDetailIcon
                  name="arrow"
                  className={`mt-1 h-4 w-4 rotate-180 text-slate-300 transition group-hover:text-slate-500 ${item.isActive ? '-rotate-90 text-slate-500' : ''}`}
                />
              </div>

              <div className="mt-4">
                <h3 className="text-base font-extrabold text-slate-900">{item.label}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{item.description}</p>
              </div>

              {item.meta ? <p className={`mt-4 text-[11px] font-extrabold ${accent.text}`}>{item.meta}</p> : null}
            </>
          )

          const className = `group flex min-h-[136px] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 ${accent.border} ${item.isActive ? 'border-[#50683f]/40 ring-4 ring-[#50683f]/10' : ''}`

          if (item.onClick) {
            return (
              <button key={item.key} type="button" onClick={item.onClick} className={className}>
                {content}
              </button>
            )
          }

          return (
            <Link key={item.key} to={item.to ?? '#'} className={className}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
