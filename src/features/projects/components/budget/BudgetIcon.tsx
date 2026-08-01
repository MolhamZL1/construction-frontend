export type BudgetIconName = 'wallet' | 'info' | 'pdf' | 'excel' | 'refresh' | 'warning' | 'materials' | 'workshops'

interface BudgetIconProps {
  name: BudgetIconName
  className?: string
}

export function BudgetIcon({ name, className }: BudgetIconProps) {
  if (name === 'wallet') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7.5h14.5A1.5 1.5 0 0 1 20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 12h4v4h-4a2 2 0 1 1 0-4Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'info') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10.5V17M12 7.2v.1" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'pdf') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7V3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 3v5h4M9 13h6M9 17h4" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'excel') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h10v18H7zM7 8h10M7 13h10M7 17h10M12 8v13" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m3.5 9 3 5m0-5-3 5" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'refresh') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 11a8 8 0 0 0-14.8-4M4 5v4h4M4 13a8 8 0 0 0 14.8 4M20 19v-4h-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'warning') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3 9 17H3L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9v5M12 17.2v.1" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'materials') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 12.5 12 17l8-4.5M4 16.5 12 21l8-4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h16M6 20v-7h4v7M14 20V8h4v12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9.5 10 6l4 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
