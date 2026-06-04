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
          <div className="absolute inset-0 rounded-full border-4 border-[#50683f]/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#50683f] border-l-[#50683f]" />
          <div className="absolute inset-3 rounded-full bg-[#50683f]/10" />
        </div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  )
}
