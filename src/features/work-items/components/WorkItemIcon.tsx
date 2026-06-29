interface WorkItemIconProps {
  name:
    | 'add'
    | 'arrow'
    | 'calendar'
    | 'check'
    | 'chevron'
    | 'clock'
    | 'comment'
    | 'delete'
    | 'edit'
    | 'equipment'
    | 'image'
    | 'info'
    | 'pause'
    | 'play'
    | 'reload'
    | 'reorder'
    | 'save'
    | 'search'
    | 'warning'
    | 'work'
  className?: string
}

export function WorkItemIcon({ name, className = 'h-5 w-5' }: WorkItemIconProps) {
  if (name === 'add') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
  }

  if (name === 'arrow') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'calendar') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'check') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'chevron') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'clock') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'comment') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 6h14v9H8l-3 3V6Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'delete') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'edit') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" strokeLinecap="round" strokeLinejoin="round" /><path d="m13.5 8.5 2 2" strokeLinecap="round" /></svg>
  }

  if (name === 'equipment') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 19V8h12v11M9 8V5h6v3M4 19h16M8 12h8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'image') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="m7 16 3.5-4 3 3 2-2 2.5 3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="9" r="1" /></svg>
  }

  if (name === 'info') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="M12 11v5M12 8h.01" strokeLinecap="round" /></svg>
  }

  if (name === 'pause') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 7v10M15 7v10" strokeLinecap="round" /></svg>
  }

  if (name === 'play') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 5v14l11-7L8 5Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'reload') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20 11a8 8 0 0 0-14.4-4.8L4 8" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 13a8 8 0 0 0 14.4 4.8L20 16" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 20v-4h-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'reorder') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 7h12M4 7h.01M8 12h12M4 12h.01M8 17h12M4 17h.01" strokeLinecap="round" /></svg>
  }

  if (name === 'save') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h12l2 2v14H5zM8 4v6h8V4M8 20v-6h8v6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'search') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
  }

  if (name === 'warning') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 9 16H3L12 3Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9v4M12 17h.01" strokeLinecap="round" /></svg>
  }

  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 7h12M6 12h12M6 17h8" strokeLinecap="round" /><circle cx="4" cy="7" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="17" r="1" /></svg>
}
