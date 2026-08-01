import { cn } from '@/utils/cn'

export type NotificationVisualKind = 'progress' | 'duration' | 'document' | 'invoice' | 'project' | 'general'

interface NotificationIconProps {
  kind?: NotificationVisualKind
  className?: string
}

export function NotificationIcon({ kind = 'general', className }: NotificationIconProps) {
  const iconClassName = cn('h-5 w-5', className)

  if (kind === 'progress') {
    return (
      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M5 19V9M12 19V5M19 19v-7" strokeLinecap="round" />
        <path d="m4 6 4 3 5-5 7 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'duration') {
    return (
      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'document') {
    return (
      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M7 3h7l4 4v14H7z" strokeLinejoin="round" />
        <path d="M14 3v5h5M10 13h5M10 17h5" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'invoice') {
    return (
      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'project') {
    return (
      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M4 7h6l2 2h8v10H4z" strokeLinejoin="round" />
        <path d="M4 7V5h6l2 2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
