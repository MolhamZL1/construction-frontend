import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { getProjectsErrorMessage, useProjectSummary, useUpdateWorkItemDetails } from '../hooks/useProjects'

function toNumber(value: string) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function isValidCount(value: string) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0
}

export function ProjectInitialWorkItemDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const navigate = useNavigate()
  const projectQuery = useProjectSummary(projectId)
  const updateMutation = useUpdateWorkItemDetails()

  const [woodDoorsCount, setWoodDoorsCount] = useState('')
  const [aluminumDoorsCount, setAluminumDoorsCount] = useState('')
  const [windowsCount, setWindowsCount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const workItems = projectQuery.data?.workItems ?? []
  const targetWorkItem = useMemo(() => {
    return workItems.find((workItem) => workItem.name.includes('ملابن')) ?? workItems.find((workItem) => Number(workItem.sortOrder) === 1) ?? null
  }, [workItems])

  if (!projectId) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!targetWorkItem) {
      setFormError('لم يتم العثور على بند ملابن الأبواب لهذا المشروع.')
      return
    }

    if (!isValidCount(woodDoorsCount) || !isValidCount(aluminumDoorsCount) || !isValidCount(windowsCount)) {
      setFormError('أدخل أرقاماً صحيحة أكبر أو تساوي صفر.')
      return
    }

    try {
      await updateMutation.mutateAsync({
        projectId,
        workItemId: targetWorkItem.id,
        woodDoorsCount: toNumber(woodDoorsCount),
        aluminumDoorsCount: toNumber(aluminumDoorsCount),
        windowsCount: toNumber(windowsCount),
      })
      navigate(`/projects/${projectId}`)
    } catch {
      return
    }
  }

  const errorMessage = updateMutation.error ? getProjectsErrorMessage(updateMutation.error) : formError

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
          <div className="space-y-2">
            <p className="text-xs font-black text-[#50683f]">خطوة مطلوبة بعد إنشاء المشروع</p>
            <h1 className="text-3xl font-black text-slate-950">أعداد الأبواب والنوافذ</h1>
            <p className="max-w-2xl text-sm font-semibold leading-7 text-slate-500">
              هذه التفاصيل هي عدد أبواب الخشب، وعدد أبواب الألمنيوم، وعدد النوافذ المطلوبة لبند ملابن الأبواب. يجب إدخالها الآن قبل متابعة إدارة المشروع.
            </p>
          </div>
        </div>

        {projectQuery.isLoading ? <LoadingState label="جاري تحميل بنود المشروع..." /> : null}

        {projectQuery.isError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            تعذر تحميل بنود المشروع. أعد المحاولة بعد التأكد من أن المشروع تم إنشاؤه بنجاح.
          </div>
        ) : null}

        {!projectQuery.isLoading && !projectQuery.isError ? (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-950">تفاصيل بند ملابن الأبواب</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                أدخل الأعداد الكلية المطلوبة بالمشروع، وسيتم حفظها مباشرة على بند ملابن الأبواب.
              </p>
              {targetWorkItem ? <p className="mt-3 text-sm font-bold text-[#50683f]">البند المحدد: {targetWorkItem.name}</p> : null}
            </div>

            {!targetWorkItem ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                لم يتم العثور على بند ملابن الأبواب ضمن بنود المشروع، لذلك لا يمكن حفظ هذه التفاصيل حالياً.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-right">
                <span className="text-sm font-extrabold text-slate-700">عدد أبواب الخشب *</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={woodDoorsCount}
                  onChange={(event) => setWoodDoorsCount(event.target.value)}
                  placeholder="مثال: 5"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                />
              </label>

              <label className="space-y-2 text-right">
                <span className="text-sm font-extrabold text-slate-700">عدد أبواب الألمنيوم *</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={aluminumDoorsCount}
                  onChange={(event) => setAluminumDoorsCount(event.target.value)}
                  placeholder="مثال: 1"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                />
              </label>

              <label className="space-y-2 text-right">
                <span className="text-sm font-extrabold text-slate-700">عدد النوافذ *</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={windowsCount}
                  onChange={(event) => setWindowsCount(event.target.value)}
                  placeholder="مثال: 10"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                />
              </label>
            </div>

            {errorMessage ? <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}
            {updateMutation.isSuccess ? <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم حفظ التفاصيل بنجاح.</div> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending || !targetWorkItem}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-6 text-sm font-extrabold text-white transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التفاصيل والمتابعة'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  )
}
