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
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">أدوات المشروع</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">وصول سريع للأدوات التي تساعدك أثناء دراسة وتنفيذ المشروع.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const accent = projectDetailAccentClasses[item.accent]
          const content = (
            <>
              <div>
                <div className="flex items-start justify-between gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.iconBox}`}>
                    <ProjectDetailIcon name={item.icon} className="h-6 w-6" />
                  </span>

                  <ProjectDetailIcon
                    name="arrow"
                    className={`mt-1 h-5 w-5 rotate-180 text-slate-300 transition group-hover:text-slate-500 ${item.isActive ? '-rotate-90 text-slate-500' : ''}`}
                  />
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{item.label}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.description}</p>
              </div>

              {item.meta ? <p className={`mt-5 text-xs font-extrabold ${accent.text}`}>{item.meta}</p> : null}
            </>
          )

          if (item.onClick) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`group flex min-h-[156px] flex-col justify-between rounded-3xl border bg-white p-5 text-right shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 ${accent.border} ${item.isActive ? 'border-[#50683f]/40 ring-4 ring-[#50683f]/10' : 'border-slate-200'}`}
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={item.key}
              to={item.to ?? '#'}
              className={`group flex min-h-[156px] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 ${accent.border}`}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
