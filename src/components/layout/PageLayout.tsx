import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageLayoutProps {
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageLayout({ title, children, actions, className }: PageLayoutProps) {
  return (
    <main className={cn('min-h-screen p-6 space-y-6', className)} dir="rtl">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>

      {children}
    </main>
  )
}
