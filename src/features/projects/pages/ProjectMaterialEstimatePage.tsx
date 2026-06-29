import { Link, useParams } from 'react-router-dom'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'

export function ProjectMaterialEstimatePage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
          <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
          العودة إلى تفاصيل المشروع
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <ProjectDetailIcon name="materials" className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">حساب كمية المواد التقديرية</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">هذه الصفحة جاهزة لإضافة أداة تقدير كميات المواد.</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
