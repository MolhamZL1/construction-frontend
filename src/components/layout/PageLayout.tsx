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
    <main className={cn('min-h-screen space-y-5 p-3 sm:space-y-6 sm:p-6', className)} dir="rtl">
      <header className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {actions ? <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{actions}</div> : null}
      </header>

      {children}
    </main>
  )
}
