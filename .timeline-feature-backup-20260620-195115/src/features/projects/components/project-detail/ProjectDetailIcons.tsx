export type ProjectDetailIconName =
  | 'arrow'
  | 'building'
  | 'calendar'
  | 'calculator'
  | 'checklist'
  | 'cloud'
  | 'document'
  | 'edit'
  | 'home'
  | 'humidity'
  | 'invoice'
  | 'location'
  | 'message'
  | 'materials'
  | 'progress'
  | 'rain'
  | 'sun'
  | 'temperature'
  | 'ruler'
  | 'users'
  | 'wind'

interface ProjectDetailIconProps {
  name: ProjectDetailIconName
  className?: string
}

export function ProjectDetailIcon({ name, className }: ProjectDetailIconProps) {
  if (name === 'arrow') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'building') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 21V4.8C6 3.8 6.8 3 7.8 3h8.4c1 0 1.8.8 1.8 1.8V21" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 21h16M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'calculator') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="3" width="12" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'checklist') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7h10M8 12h10M8 17h10" strokeLinecap="round" />
        <path d="m4 7 1 1 2-2M4 12l1 1 2-2M4 17l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'cloud') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7.5 18h9a4 4 0 0 0 .5-7.96A5.5 5.5 0 0 0 6.44 8.5 4.8 4.8 0 0 0 7.5 18Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'document') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7V3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 3v5h4M9.5 12h5M9.5 16h5" strokeLinecap="round" />
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

  if (name === 'home') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m4 11 8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10.5V20h11v-9.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 20v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'humidity') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21a6 6 0 0 0 6-6c0-4-6-12-6-12S6 11 6 15a6 6 0 0 0 6 6Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 15.5a3 3 0 0 0 5 0" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'location') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.4" />
      </svg>
    )
  }

  if (name === 'message') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5h14v10H8l-3 4V5Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }


  if (name === 'invoice') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h10l2 3v15l-3-2-3 2-3-2-3 2zM10 9h5M10 13h5M10 17h3" strokeLinecap="round" strokeLinejoin="round" />
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

  if (name === 'progress') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19V9M11 19V5M17 19v-7" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'rain') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7.5 14.5h9a3.8 3.8 0 0 0 .5-7.56A5.2 5.2 0 0 0 7 6.2a4.4 4.4 0 0 0 .5 8.3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 18.5v1.2M12 17.5v1.2M16 18.5v1.2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'sun') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'temperature') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 14.7V5a2 2 0 1 1 4 0v9.7a4 4 0 1 1-4 0Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17.5v-5" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'ruler') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m4 16 8-8 8 8-4 4-8-8-4 4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m8 12 2 2m2-6 2 2m2 2 2 2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'wind') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8h10a3 3 0 1 0-3-3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 12h15" strokeLinecap="round" />
        <path d="M4 16h9a3 3 0 1 1-3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 11a4 4 0 1 0-8 0" strokeLinecap="round" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
      <path d="M18 8.5a3 3 0 0 1 2 2.8M6 8.5a3 3 0 0 0-2 2.8" strokeLinecap="round" />
    </svg>
  )
}
