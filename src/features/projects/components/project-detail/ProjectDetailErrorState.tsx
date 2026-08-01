import { Link } from 'react-router-dom'

interface ProjectDetailErrorStateProps {
  title: string
  description?: string
}

export function ProjectDetailErrorState({ title, description }: ProjectDetailErrorStateProps) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-6" dir="rtl">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_14px_40px_rgb(var(--color-brand-ink-rgb)/0.08)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
          <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7v6M12 16.5v.1" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
        {description ? <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p> : null}
        <Link
          to="/projects"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)]"
        >
          العودة للمشاريع
        </Link>
      </div>
    </section>
  )
}
