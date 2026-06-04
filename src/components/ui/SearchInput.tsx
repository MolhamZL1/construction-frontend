import { cn } from '@/utils/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
  clearLabel?: string
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'بحث...',
  className,
  inputClassName,
  disabled = false,
  clearLabel = 'مسح البحث',
}: SearchInputProps) {
  return (
    <div
      dir="rtl"
      className={cn(
        'flex h-11 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-500 transition focus-within:border-[#50683f] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#50683f]/10',
        disabled && 'opacity-70',
        className
      )}
    >
      <svg className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn('h-full min-w-0 flex-1 bg-transparent text-right text-sm text-slate-900 outline-none placeholder:text-slate-400', inputClassName)}
        placeholder={placeholder}
        type="search"
        disabled={disabled}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
          aria-label={clearLabel}
          title={clearLabel}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
