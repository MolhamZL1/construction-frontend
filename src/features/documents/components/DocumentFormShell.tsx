import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DocumentIcon } from './DocumentIcon'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface DocumentFormShellProps {
  title: string
  description: string
  breadcrumbs: BreadcrumbItem[]
  children: ReactNode
}

export function DocumentFormShell({ title, description, breadcrumbs, children }: DocumentFormShellProps) {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-bold text-slate-500">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 ? <DocumentIcon name="arrow" className="h-4 w-4 rotate-180" /> : null}
              {item.to ? (
                <Link to={item.to} className="transition hover:text-[var(--color-brand-ink)]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800">{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-[0_14px_40px_rgb(var(--color-brand-ink-rgb)/0.07)] md:p-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
              <DocumentIcon name="upload" className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">{title}</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">{description}</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </section>
  )
}
