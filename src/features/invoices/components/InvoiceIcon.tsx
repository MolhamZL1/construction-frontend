type InvoiceIconName = 'archive' | 'arrow' | 'box' | 'calendar' | 'details' | 'file' | 'plus' | 'receipt' | 'search' | 'trash' | 'user' | 'wallet' | 'warning'

interface InvoiceIconProps {
  name: InvoiceIconName
  className?: string
}

export function InvoiceIcon({ name, className = 'h-5 w-5' }: InvoiceIconProps) {
  if (name === 'archive') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M6 7v13h12V7M8 4h8l1 3H7zM10 11h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'arrow') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'box') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'calendar') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'details') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5M10 16h5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'file') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h10l2 3v15l-3-2-3 2-3-2-3 2zM10 9h5M10 13h5M10 17h3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'plus') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
  }

  if (name === 'search') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
  }

  if (name === 'trash') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'user') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" /></svg>
  }

  if (name === 'wallet') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16v12H4zM4 7l3-3h10l3 3M16 13h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'warning') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 10 18H2z" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9v5M12 17.5v.1" strokeLinecap="round" /></svg>
  }

  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h10l2 3v15l-3-2-3 2-3-2-3 2zM10 9h5M10 13h5M10 17h3" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
