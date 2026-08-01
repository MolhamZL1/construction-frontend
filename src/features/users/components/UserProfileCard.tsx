import type { User } from '../types/user.types'
import { RoleBadge } from './RoleBadge'
import { StatusBadge } from './StatusBadge'

interface UserProfileCardProps {
  user: User
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21a8 8 0 0 0-16 0" strokeLinecap="round" />
              <circle cx="12" cy="8" r="4" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold leading-tight text-[var(--color-brand-ink)]">
              {user.name ?? '—'}
            </h2>

            <p className="mt-2 truncate text-sm font-medium text-[var(--color-brand-stone)]" dir="ltr">
              {user.internal_id ?? '—'}
            </p>

            {user.email ? (
              <p className="mt-1 truncate text-sm font-medium text-[var(--color-brand-stone)]" dir="ltr">
                {user.email}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-[var(--color-brand-stone)] sm:min-w-72">
          <InfoRow label="تاريخ الانضمام" value={formatNumericArabicDate(user.created_at)} />
          <InfoRow label="آخر تحديث" value={formatNumericArabicDate(user.updated_at)} />
          <InfoRow label="المعرف الداخلي" value={user.internal_id ?? '—'} ltr />
        </div>
      </div>
    </section>
  )
}

function InfoRow({
  label,
  value,
  ltr,
}: {
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="text-[var(--color-brand-ink)]" dir={ltr ? 'ltr' : 'rtl'}>
        {value}
      </span>
    </div>
  )
}

function formatNumericArabicDate(date?: string) {
  if (!date) {
    return '—'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('ar-SY-u-nu-arab', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(parsedDate)
}