import { Link } from 'react-router-dom'

interface BackButtonProps {
  to: string
  label: string
}

export function BackButton({ to, label }: BackButtonProps) {
  return (
    <Link
      to={to}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#50683f] hover:bg-[#eef4eb] hover:text-[#50683f]"
    >
      <svg className="h-5 w-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  )
}
