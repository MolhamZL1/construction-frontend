import { clampProgressPercent } from '../../utils/projects-formatters'

interface ProjectDetailProgressBarProps {
  value: number
  compact?: boolean
}

export function ProjectDetailProgressBar({ value, compact = false }: ProjectDetailProgressBarProps) {
  const progress = clampProgressPercent(value)

  if (compact) {
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    return (
       <div
        className="flex shrink-0 items-center justify-center"
        aria-label={`نسبة الإنجاز ${progress}%`}
      >
        <div className="relative h-16 w-16 sm:h-[68px] sm:w-[68px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72" role="img">
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="white"
              stroke="currentColor"
              strokeWidth="5.5"
              className="text-slate-100"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
              className="text-[var(--color-brand-ink)] transition-all duration-700 ease-out"
              style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black leading-none tracking-tight text-slate-900" dir="ltr">
              {progress}%
            </span>
           
          </div>
        </div>
      </div>
    )
  }

  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex items-center justify-center" aria-label={`نسبة الإنجاز ${progress}%`}>
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 112 112" role="img">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            className="text-slate-100"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            className="text-[var(--color-brand-ink)] transition-all duration-700 ease-out"
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-slate-900" dir="ltr">
            {progress}%
          </span>
          <span className="mt-1 text-xs font-extrabold text-slate-500">نسبة الإنجاز</span>
        </div>
      </div>
    </div>
  )
}
