import { ProjectDetailSectionCard } from './ProjectDetailSectionCard'

interface ProjectDetailSectionsPanelProps {
  projectId: string
  engineersCount: number
  spacesCount: number
  workItemsCount: number
  documentsCount?: number
}

export function ProjectDetailSectionsPanel({
  projectId,
  engineersCount,
  spacesCount,
  workItemsCount,
  documentsCount = 0,
}: ProjectDetailSectionsPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-[0_14px_40px_rgba(15,23,42,0.07)] md:p-7">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold text-slate-900">أقسام المشروع</h2>
        <p className="text-sm font-medium text-slate-500">الوصول السريع للأقسام الأساسية داخل المشروع</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ProjectDetailSectionCard
          title="فريق العمل"
          description={`${engineersCount} عضو`}
          icon="users"
          accent="purple"
          to={`/projects/${projectId}/team`}
        />
        <ProjectDetailSectionCard
          title="الفراغات"
          description={`${spacesCount} فراغ`}
          icon="home"
          accent="blue"
          to={`/projects/${projectId}/spaces`}
        />
        <ProjectDetailSectionCard
          title="بنود العمل"
          description={`${workItemsCount} بند`}
          icon="checklist"
          accent="emerald"
          to={`/projects/${projectId}/work-items`}
        />
        <ProjectDetailSectionCard
          title="المستندات"
          description={`${documentsCount} مستند`}
          icon="document"
          accent="orange"
          to={`/projects/${projectId}/documents`}
        />
        <ProjectDetailSectionCard
          title="الفواتير"
          description="فواتير بنود العمل"
          icon="invoice"
          accent="green"
          to={`/projects/${projectId}/invoices`}
        />
      </div>
    </section>
  )
}
