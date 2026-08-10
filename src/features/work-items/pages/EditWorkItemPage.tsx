import { useParams } from 'react-router-dom'
import { BackButton } from '@/components/ui'

export function EditWorkItemPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)]">
        <h1 className="text-2xl font-black text-slate-900">تم نقل تعديل البند إلى الجدول</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
          حسب الآلية الجديدة، لا يمكن تعديل تفاصيل البنود من صفحة منفصلة. التعديل مسموح فقط للمدة المتوقعة ومستوى الجودة من جدول بنود العمل قبل بدء البند.
        </p>
        <div className="mt-5">
          <BackButton to={`/projects/${projectId}/work-items`} label="العودة إلى بنود العمل" />
        </div>
      </div>
    </section>
  )
}
