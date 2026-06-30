import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { getProjectsErrorMessage, useProjectSummary, useUpdateWorkItemDetails } from '../hooks/useProjects'

function toInteger(value: string) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function isValidCount(value: string) {
  if (!value.trim()) return false

  const numericValue = Number(value)
  return Number.isFinite(numericValue) && Number.isInteger(numericValue) && numericValue >= 0
}

function CountField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)] transition focus-within:border-[#50683f] focus-within:ring-4 focus-within:ring-[#50683f]/10">
      <span className="mb-3 block text-sm font-black text-slate-800">{label}</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-right text-lg font-black text-slate-900 outline-none placeholder:text-sm placeholder:font-bold placeholder:text-slate-400"
      />
    </label>
  )
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
    return <section className="min-h-screen bg-slate-50 p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!targetWorkItem) {
      setFormError('لم يتم العثور على بند ملابن الأبواب لهذا المشروع.')
      return
    }

    if (!isValidCount(woodDoorsCount) || !isValidCount(aluminumDoorsCount) || !isValidCount(windowsCount)) {
      setFormError('أدخل أعداداً صحيحة أكبر أو تساوي صفر.')
      return
    }

    try {
      await updateMutation.mutateAsync({
        projectId,
        workItemId: targetWorkItem.id,
        woodDoorsCount: toInteger(woodDoorsCount),
        aluminumDoorsCount: toInteger(aluminumDoorsCount),
        windowsCount: toInteger(windowsCount),
      })
      navigate(`/projects/${projectId}`)
    } catch {
      return
    }
  }

  const errorMessage = updateMutation.error ? getProjectsErrorMessage(updateMutation.error) : formError
  const projectName = projectQuery.data?.project.name

  return (
    <section className="min-h-screen bg-slate-50 px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-[#50683f]/10 px-3 py-1 text-xs font-black text-[#50683f]">
                خطوة إعداد أولية
              </span>
              <h1 className="text-3xl font-black text-slate-950">تحديد كميات الملابن</h1>
              <p className="max-w-2xl text-sm font-semibold leading-7 text-slate-500">
                أدخل الأعداد الكلية لبند ملابن الأبواب والنوافذ قبل متابعة إدارة المشروع.
              </p>
            </div>

            {projectName ? (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4 text-right">
                <p className="text-xs font-black text-slate-400">المشروع</p>
                <p className="mt-1 text-base font-black text-slate-900">{projectName}</p>
              </div>
            ) : null}
          </div>
        </header>

        {projectQuery.isLoading ? <LoadingState label="جاري تحميل بنود المشروع..." /> : null}

        {projectQuery.isError ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            تعذر تحميل بنود المشروع. تأكد من إنشاء المشروع ثم أعد المحاولة.
          </div>
        ) : null}

        {!projectQuery.isLoading && !projectQuery.isError ? (
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">بيانات بند ملابن الأبواب</h2>
                {targetWorkItem ? <p className="mt-2 text-sm font-bold text-[#50683f]">سيتم الحفظ على: {targetWorkItem.name}</p> : null}
              </div>
            </div>

            {!targetWorkItem ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                لم يتم العثور على بند ملابن الأبواب ضمن بنود المشروع.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <CountField
                label="إجمالي ملابن أبواب الخشب"
                value={woodDoorsCount}
                onChange={setWoodDoorsCount}
                placeholder="مثال: 5"
              />
              <CountField
                label="إجمالي ملابن أبواب الألمنيوم"
                value={aluminumDoorsCount}
                onChange={setAluminumDoorsCount}
                placeholder="مثال: 1"
              />
              <CountField
                label="إجمالي ملابن النوافذ"
                value={windowsCount}
                onChange={setWindowsCount}
                placeholder="مثال: 10"
              />
            </div>

            {errorMessage ? <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}
            {updateMutation.isSuccess ? <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم حفظ الكميات بنجاح.</div> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending || !targetWorkItem}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-7 text-sm font-black text-white transition hover:bg-[#405633] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ ومتابعة'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  )
}
