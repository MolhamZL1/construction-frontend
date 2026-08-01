import type { UserProject } from '../types/user.types'

interface UserDetailsSummaryCardsProps {
  projects: UserProject[]
}

const activeProjectStatuses = new Set([
  'active',
  'in_progress',
  'started',
  'ongoing',
  'قيد التنفيذ',
  'جاري التنفيذ',
])

const completedProjectStatuses = new Set([
  'completed',
  'done',
  'finished',
  'مكتمل',
  'منتهي',
])

export function UserDetailsSummaryCards({ projects }: UserDetailsSummaryCardsProps) {
  const activeProjectsCount = projects.filter(
    (project) => project.status && activeProjectStatuses.has(project.status),
  ).length

  const completedProjectsCount = projects.filter(
    (project) => project.status && completedProjectStatuses.has(project.status),
  ).length

  const cards = [
    {
      label: 'إجمالي المشاريع',
      value: projects.length,
      icon: 'total',
      tone: 'slate',
    },
    {
      label: 'مشاريع جارية',
      value: activeProjectsCount,
      icon: 'active',
      tone: 'cyan',
    },
    {
      label: 'مشاريع مكتملة',
      value: completedProjectsCount,
      icon: 'completed',
      tone: 'emerald',
    },
  ] as const

  return (
    <section dir="rtl" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-brand-stone)]">{card.label}</p>
              <p className="mt-2 text-2xl font-bold leading-none text-[var(--color-brand-ink)]">
                {card.value.toLocaleString('ar-SY')}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconClass(
                card.tone,
              )}`}
            >
              <SummaryIcon name={card.icon} />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

function getIconClass(tone: 'slate' | 'cyan' | 'emerald') {
  if (tone === 'cyan') {
    return 'bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-gold)]'
  }

  if (tone === 'emerald') {
    return 'bg-emerald-50 text-emerald-500'
  }

  return 'bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]'
}

function SummaryIcon({ name }: { name: 'total' | 'active' | 'completed' }) {
  if (name === 'active') {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'completed') {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12.5 2.3 2.3 4.7-5.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 5h9v14H8z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8h3v11H5zM11 9h3M11 13h3M11 17h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}