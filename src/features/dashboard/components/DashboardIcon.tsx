export type DashboardIconName =
  | 'project'
  | 'user'
  | 'progress'
  | 'clock'
  | 'star'
  | 'robot'
  | 'image'
  | 'send'
  | 'refresh'
  | 'arrow'
  | 'calendar'
  | 'sparkles'
  | 'chart'
  | 'material'
  | 'equipment'

export function DashboardIcon({ name, className = 'h-5 w-5' }: { name: DashboardIconName; className?: string }) {
  const common = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }

  if (name === 'project') {
    return <svg {...common}><path d="M4 6h16v14H4zM8 6V4h8v2M8 11h8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'user') {
    return <svg {...common}><circle cx="9" cy="8" r="4" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M18 8v6M15 11h6" strokeLinecap="round" /></svg>
  }

  if (name === 'material') {
    return <svg {...common}><path d="m4 8 8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'equipment') {
    return <svg {...common}><path d="M6 7h12l1 4v7H5v-7zM8 7V4h8v3M5 13h14M8 18v2M16 18v2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" /></svg>
  }

  if (name === 'progress') {
    return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M3 19h18" strokeLinecap="round" /><path d="m5 7 4-3 4 3 6-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'clock') {
    return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'star') {
    return <svg {...common} fill="currentColor" stroke="none"><path d="m12 2.7 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2-4.5-4.4 6.3-.9z" /></svg>
  }

  if (name === 'robot') {
    return <svg {...common}><path d="M12 3v3M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 13h.01M15 13h.01M9.5 17h5M4 12H2M22 12h-2" strokeLinecap="round" /></svg>
  }

  if (name === 'image') {
    return <svg {...common}><path d="M4 5h16v14H4z" strokeLinecap="round" strokeLinejoin="round" /><path d="m7 16 3.5-4 2.5 2.5 2-2 3 3.5M8 9h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'send') {
    return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'refresh') {
    return <svg {...common}><path d="M20 6v5h-5M4 18v-5h5M18.2 9A7 7 0 0 0 6.3 6.7L4 9M5.8 15a7 7 0 0 0 11.9 2.3L20 15" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'calendar') {
    return <svg {...common}><path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'sparkles') {
    return <svg {...common}><path d="m12 3 1.2 3.2L16 7.5l-2.8 1.3L12 12l-1.2-3.2L8 7.5l2.8-1.3zM18 13l.8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8zM6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'chart') {
    return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M3 19h18" strokeLinecap="round" /></svg>
  }

  return <svg {...common}><path d="M8 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
