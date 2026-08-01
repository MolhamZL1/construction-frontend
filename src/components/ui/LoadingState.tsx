import { cn } from '@/utils/cn'

interface LoadingStateProps {
  label?: string
  className?: string
  compact?: boolean
}

export function LoadingState({ label = 'جاري تحميل البيانات...', className, compact = false }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-sm',
        compact ? 'px-4 py-8' : 'px-4 py-14',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[rgb(var(--color-brand-ink-rgb)/0.1)]" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--color-brand-ink)] border-l-[var(--color-brand-ink)]" />
          <div className="absolute inset-3 rounded-full bg-[rgb(var(--color-brand-gold-rgb)/0.1)]" />
        </div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  )
}
