import type { ReactNode } from 'react'

interface ExpensesPageShellProps {
  children: ReactNode
  size?: 'default' | 'narrow'
}

export function ExpensesPageShell({ children, size = 'default' }: ExpensesPageShellProps) {
  const maxWidthClass = size === 'narrow' ? 'max-w-3xl' : 'max-w-7xl'

  return (
    <section className={`mx-auto w-full ${maxWidthClass} space-y-6 px-4 py-6 sm:px-6 lg:px-8`}>
      {children}
    </section>
  )
}
