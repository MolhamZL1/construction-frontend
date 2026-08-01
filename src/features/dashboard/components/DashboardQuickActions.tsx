import { Link } from 'react-router-dom'

import { cn } from '@/utils/cn'

import { DashboardIcon, type DashboardIconName } from './DashboardIcon'

interface DashboardQuickActionsProps {
  onAddUser: () => void
}

interface QuickActionContentProps {
  icon: DashboardIconName
  label: string
  accentClassName: string
  glowClassName: string
}

const actionBaseClassName =
  'group relative flex min-h-[108px] w-full items-center justify-between overflow-hidden rounded-[26px] border border-white/80 bg-white/[0.68] p-4 text-right shadow-[0_14px_38px_rgb(var(--color-brand-ink-rgb)/0.09),inset_0_1px_0_rgb(255_255_255/0.92)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/[0.82] hover:shadow-[0_20px_50px_rgb(var(--color-brand-ink-rgb)/0.14),inset_0_1px_0_rgb(255_255_255/0.95)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--color-brand-gold-rgb)/0.2)] sm:min-h-[118px] sm:p-5'

export function DashboardQuickActions({ onAddUser }: DashboardQuickActionsProps) {
  return (
    <nav
      aria-label="إجراءات سريعة"
      className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      <Link to="/projects/create" className={actionBaseClassName}>
        <QuickActionContent
          icon="project"
          label="إنشاء مشروع"
          accentClassName="bg-[rgb(var(--color-brand-ink-rgb)/0.1)] text-[var(--color-brand-ink)]"
          glowClassName="bg-[rgb(var(--color-brand-ink-rgb)/0.13)]"
        />
      </Link>

      <button type="button" onClick={onAddUser} className={actionBaseClassName}>
        <QuickActionContent
          icon="user"
          label="إضافة مستخدم"
          accentClassName="bg-[rgb(var(--color-brand-gold-rgb)/0.16)] text-[var(--color-brand-gold-deep)]"
          glowClassName="bg-[rgb(var(--color-brand-gold-rgb)/0.2)]"
        />
      </button>

      <Link to="/materials/create" className={actionBaseClassName}>
        <QuickActionContent
          icon="material"
          label="إضافة مادة"
          accentClassName="bg-[rgb(var(--color-success-rgb)/0.1)] text-[var(--color-success)]"
          glowClassName="bg-[rgb(var(--color-success-rgb)/0.14)]"
        />
      </Link>

      <Link to="/equipments?create=1" className={actionBaseClassName}>
        <QuickActionContent
          icon="equipment"
          label="إضافة معدة"
          accentClassName="bg-[rgb(var(--color-info-rgb)/0.1)] text-[var(--color-info)]"
          glowClassName="bg-[rgb(var(--color-info-rgb)/0.14)]"
        />
      </Link>
    </nav>
  )
}

function QuickActionContent({ icon, label, accentClassName, glowClassName }: QuickActionContentProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full opacity-80 blur-3xl transition duration-300 group-hover:scale-125',
          glowClassName,
        )}
      />

      <span className="relative z-10 flex min-w-0 items-center gap-3 sm:gap-4">
        <span
          className={cn(
            'grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/75 shadow-[0_8px_22px_rgb(var(--color-brand-ink-rgb)/0.07)] transition duration-300 group-hover:scale-105 group-hover:rotate-[-3deg] sm:h-14 sm:w-14',
            accentClassName,
          )}
        >
          <DashboardIcon name={icon} className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>

        <span className="truncate text-sm font-black text-[var(--color-brand-ink)] sm:text-base">
          {label}
        </span>
      </span>

      <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[rgb(var(--color-brand-stone-rgb)/0.16)] bg-white/[0.65] text-[var(--color-brand-stone)] transition duration-300 group-hover:-translate-x-1 group-hover:border-[rgb(var(--color-brand-gold-rgb)/0.35)] group-hover:text-[var(--color-brand-gold-deep)]">
        <DashboardIcon name="arrow" className="h-4 w-4" />
      </span>
    </>
  )
}
