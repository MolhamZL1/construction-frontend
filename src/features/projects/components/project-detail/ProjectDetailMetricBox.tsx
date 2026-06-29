import { ProjectDetailIcon, type ProjectDetailIconName } from './ProjectDetailIcons'

interface ProjectDetailMetricBoxProps {
  icon: ProjectDetailIconName
  label: string
  value: string
}

export function ProjectDetailMetricBox({ icon, label, value }: ProjectDetailMetricBoxProps) {
  return (
    <div className="flex min-h-[72px] items-center justify-between gap-4 rounded-2xl bg-slate-50 px-5 py-4 text-right">
      <ProjectDetailIcon name={icon} className="h-5 w-5 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="mt-1 text-lg font-extrabold text-slate-900" dir="ltr">
          {value}
        </p>
      </div>
    </div>
  )
}
