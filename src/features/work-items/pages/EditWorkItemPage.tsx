import { Link, useParams } from 'react-router-dom'

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
        <Link to={`/projects/${projectId}/work-items`} className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white">
          العودة إلى الجدول
        </Link>
      </div>
    </section>
  )
}
