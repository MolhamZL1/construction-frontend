interface MaterialIconProps {
  name: 'box' | 'ruler' | 'layers' | 'calendar' | 'search' | 'plus' | 'edit' | 'delete' | 'save' | 'back' | 'empty' | 'link'
  className?: string
}

export function MaterialIcon({ name, className = 'h-5 w-5' }: MaterialIconProps) {
  if (name === 'box') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'ruler') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 17 17 4l3 3L7 20zM8 13l2 2M11 10l2 2M14 7l2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'layers') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3 8 4-8 4-8-4 8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" strokeLinecap="round" strokeLinejoin="round" />
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

  if (name === 'search') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" strokeLinecap="round" />
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

  if (name === 'edit') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19h4l10-10-4-4L5 15v4zM14 6l4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'delete') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'save') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 4h12l2 2v14H5zM8 4v6h8V4M8 20v-6h8v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'back') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'empty') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4 7.5l8 4.5 8-4.5M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 15h7" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9.5 14.5 14.5 9.5M10.5 7.5l1-1a4 4 0 0 1 5.7 5.7l-1 1M13.5 16.5l-1 1a4 4 0 0 1-5.7-5.7l1-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
