import { clampProgressPercent } from '../../utils/projects-formatters'

interface ProjectDetailProgressBarProps {
  value: number
}

export function ProjectDetailProgressBar({ value }: ProjectDetailProgressBarProps) {
  const progress = clampProgressPercent(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
        <span>نسبة الإنجاز</span>
        <span dir="ltr" className="text-sm text-[#50683f]">
          {progress}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" dir="ltr">
        <div className="h-full rounded-full bg-[#50683f] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
