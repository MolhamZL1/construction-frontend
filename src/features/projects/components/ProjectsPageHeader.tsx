interface ProjectsPageHeaderProps {
  title?: string
  description?: string
}

export function ProjectsPageHeader({
  title = 'إدارة المشاريع',
  description = 'إدارة مشاريع التشطيبات الإنشائية',
}: ProjectsPageHeaderProps) {
  return (
    <div className="text-right">
      <h1 className="text-3xl font-extrabold leading-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-sm font-semibold text-slate-500">{description}</p>
    </div>
  )
}
