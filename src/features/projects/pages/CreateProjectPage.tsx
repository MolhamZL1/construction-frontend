import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/ui'
import { CreateProjectForm } from '../components/CreateProjectForm'
import { ProjectsPageHeader } from '../components/ProjectsPageHeader'

export function CreateProjectPage() {
  const navigate = useNavigate()

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <ProjectsPageHeader title="إضافة مشروع" description="أدخل بيانات المشروع وحدد موقعه على الخريطة" />
          <BackButton to="/projects" label="العودة للمشاريع" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-6">
          <CreateProjectForm onCreated={(project) => navigate(`/projects/${project.id}/initial-work-item-details`)} />
        </div>
      </div>
    </section>
  )
}
