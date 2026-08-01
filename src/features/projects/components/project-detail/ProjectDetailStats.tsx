
import { Link } from 'react-router-dom'
import { ProjectDetailIcon, type ProjectDetailIconName } from './ProjectDetailIcons'
 
export type ProjectDetailAccent = 'cyan' | 'blue' | 'green' | 'orange' | 'purple'
 
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
 
// ألوان الأيقونة وزوايا التأطير والـ shadow لكل أداة، بدل ألوان بطاقات جاهزة
const accentClasses: Record<ProjectDetailAccent, { icon: string; bracket: string; glow: string }> = {
  cyan: { icon: 'text-cyan-600', bracket: 'border-cyan-500', glow: 'bg-cyan-500/30' },
  blue: { icon: 'text-blue-600', bracket: 'border-blue-500', glow: 'bg-blue-500/30' },
  green: { icon: 'text-[var(--color-brand-ink)]', bracket: 'border-[var(--color-brand-ink)]', glow: 'bg-[rgb(var(--color-brand-ink-rgb)/0.3)]' },
  orange: { icon: 'text-orange-600', bracket: 'border-orange-500', glow: 'bg-orange-500/30' },
  purple: { icon: 'text-purple-600', bracket: 'border-purple-500', glow: 'bg-purple-500/30' },
}
 
export function ProjectDetailStats({ items }: ProjectDetailStatsProps) {
  return (
    <section className="space-y-6 text-right">
       
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => {
          const accent = accentClasses[item.accent]
 
          const content = (
            <>
              <div className="relative flex h-14 w-14 items-center justify-center">
                <span
                  aria-hidden="true"
                  className={`absolute h-9 w-9 rounded-full blur-lg transition-opacity duration-150 ${accent.glow} ${
                     'opacity-100'
                  }`}
                />
               
            
                <ProjectDetailIcon
                  name={item.icon}
                  className={`relative h-7 w-7 transition-transform duration-150 group-hover:scale-110 ${accent.icon}`}
                />
              </div>
 
              <p className="text-center text-[13px] font-bold text-slate-900">{item.label}</p>
            </>
          )
 
          const className =
            'group flex flex-col items-center gap-3.5 rounded-xl px-2 py-5 text-right transition hover:bg-slate-50'
 
          if (item.onClick) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                title={item.description}
                className={className}
              >
                {content}
              </button>
            )
          }
 
          return (
            <Link key={item.key} to={item.to ?? '#'} title={item.description} className={className}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}