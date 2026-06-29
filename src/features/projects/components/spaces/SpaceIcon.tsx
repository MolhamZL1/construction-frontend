export type SpaceIconName =
  | 'area'
  | 'arrow'
  | 'bathroom'
  | 'ceiling'
  | 'delete'
  | 'edit'
  | 'finish'
  | 'home'
  | 'kitchen'
  | 'lock'
  | 'plus'
  | 'room'
  | 'search'
  | 'shed'
  | 'toilet'
  | 'warning'

interface SpaceIconProps {
  name: SpaceIconName
  className?: string
}

export function SpaceIcon({ name, className }: SpaceIconProps) {
  if (name === 'area') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 5h6M19 9v6M15 19H9M5 15V9" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'arrow') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'bathroom') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 10V6a3 3 0 0 1 6 0v4" strokeLinecap="round" />
        <path d="M4 11h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 19v2M16 19v2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'ceiling') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m4 8 8-4 8 4-8 4-8-4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m4 13 8 4 8-4M4 18l8 4 8-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'delete') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'edit') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m14 8 2 2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'finish') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19h14M7 16l8.5-8.5a2.1 2.1 0 0 1 3 3L10 19H7v-3Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'kitchen') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3v7M10 3v7M8 10v11M16 3v18" strokeLinecap="round" />
        <path d="M14 9h4" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'lock') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 11V8a5 5 0 0 1 10 0v3" strokeLinecap="round" />
        <path d="M6 11h12v10H6V11Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15v2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'plus') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'search') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'shed') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m4 11 8-6 8 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10.5V20h11v-9.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 20v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'toilet') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 4h8v7a4 4 0 0 1-8 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 15v5h4v-5M8 8h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'warning') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 2.8 20h18.4L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9v5M12 17.5v.1" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4 11 8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.5V20h11v-9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
