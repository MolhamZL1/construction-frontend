import { BudgetIcon } from './BudgetIcon'

interface BudgetUnavailableStateProps {
  title: string
  description: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function BudgetUnavailableState({ title, description, onRetry, isRetrying = false }: BudgetUnavailableStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-5 py-8 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
        <BudgetIcon name="warning" className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">{description}</p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-xs font-extrabold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BudgetIcon name="refresh" className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  )
}
