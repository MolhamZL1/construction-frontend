interface ProjectsPageHeaderProps {
  title?: string
  description?: string
}

export function ProjectsPageHeader({
  title = 'إدارة المشاريع',
}: ProjectsPageHeaderProps) {
  return (
    <div className="text-right">
      <h1 className="text-3xl font-extrabold leading-tight text-slate-900">{title}</h1>
    </div>
  )
}
