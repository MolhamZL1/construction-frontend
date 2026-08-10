import { Link } from 'react-router-dom'

interface BackButtonProps {
  to: string
  label: string
}

export function BackButton({ to, label }: BackButtonProps) {
  return (
    <Link
      to={to}
      className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-600 shadow-[0_5px_16px_rgb(var(--color-brand-ink-rgb)/0.05)] transition hover:-translate-y-0.5 hover:border-[rgb(var(--color-brand-gold-rgb)/0.38)] hover:bg-[var(--color-brand-gold-surface)] hover:text-[var(--color-brand-ink)] hover:shadow-[0_9px_22px_rgb(var(--color-brand-ink-rgb)/0.08)] active:translate-y-0"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-white group-hover:text-[var(--color-brand-gold-deep)]">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{label}</span>
    </Link>
  )
}
