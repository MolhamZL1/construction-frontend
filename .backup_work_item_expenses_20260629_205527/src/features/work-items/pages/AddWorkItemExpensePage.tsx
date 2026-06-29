import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectDetailIcon } from '@/features/projects/components/project-detail/ProjectDetailIcons'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { getWorkItemsErrorMessage, useWorkItems } from '../hooks/useWorkItems'
import { useAddWorkItemExpense } from '../hooks/useWorkItemExpenses'

export function AddWorkItemExpensePage() {
  const navigate = useNavigate()
  const { id, workItemId } = useParams<{ id: string; workItemId?: string }>()
  const projectId = id ?? ''
  const [selectedWorkItemId, setSelectedWorkItemId] = useState(workItemId ?? '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const workItemsQuery = useWorkItems(projectId)
  const addExpenseMutation = useAddWorkItemExpense()

  const activeWorkItems = useMemo(
    () => (workItemsQuery.data ?? []).filter((item) => item.isActive),
    [workItemsQuery.data]
  )

  useEffect(() => {
    if (workItemId) {
      setSelectedWorkItemId(workItemId)
      return
    }

    if (!selectedWorkItemId && activeWorkItems.length > 0) {
      setSelectedWorkItemId(activeWorkItems[0].id)
    }
  }, [activeWorkItems, selectedWorkItemId, workItemId])

  const project = summaryQuery.data?.project
  const selectedWorkItem = activeWorkItems.find((item) => item.id === selectedWorkItemId)
  const backTo = selectedWorkItemId
    ? `/projects/${projectId}/work-items/${selectedWorkItemId}/expenses`
    : `/projects/${projectId}/expenses`

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!projectId || !selectedWorkItemId) {
      setFormError('اختر بند العمل أولاً.')
      return
    }

    const numericAmount = Number(amount)
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('أدخل قيمة مصروف صحيحة أكبر من صفر.')
      return
    }

    if (!description.trim()) {
      setFormError('اكتب وصف المصروف.')
      return
    }

    setFormError(null)

    try {
      await addExpenseMutation.mutateAsync({
        projectId,
        workItemId: selectedWorkItemId,
        amount,
        description,
      })

      navigate(`/projects/${projectId}/work-items/${selectedWorkItemId}/expenses`)
    } catch {
      return
    }
  }

  if (!projectId) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-600">
          رابط المشروع غير صحيح.
        </div>
      </section>
    )
  }

  const errorMessage =
    formError ??
    (summaryQuery.error ? getWorkItemsErrorMessage(summaryQuery.error) : null) ??
    (workItemsQuery.error ? getWorkItemsErrorMessage(workItemsQuery.error) : null) ??
    (addExpenseMutation.error ? getWorkItemsErrorMessage(addExpenseMutation.error) : null)

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
              <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
              العودة إلى مصاريف الورشات
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold text-slate-900">إضافة مصروف ورشة</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              سجل مصروف جديد ضمن المشروع{project ? `: ${project.name}` : ''}
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <ProjectDetailIcon name="invoice" className="h-9 w-9" />
          </div>
        </div>

        {summaryQuery.isLoading || workItemsQuery.isLoading ? (
          <LoadingState label="جاري تحميل بيانات الإضافة..." />
        ) : activeWorkItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-extrabold text-slate-900">لا توجد بنود عمل فعالة</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">لا يمكن إضافة مصروف قبل وجود بند عمل فعال.</p>
            <Link to={`/projects/${projectId}/work-items`} className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-extrabold text-white transition hover:bg-[#435834]">
              الذهاب إلى بنود العمل
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
              <p className="text-sm font-extrabold text-emerald-700">البند المحدد</p>
              <p className="mt-2 text-xl font-black text-slate-900">{selectedWorkItem?.name ?? 'اختر بند العمل'}</p>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">بند العمل</span>
              <select
                value={selectedWorkItemId}
                onChange={(event) => {
                  setSelectedWorkItemId(event.target.value)
                  setFormError(null)
                }}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
              >
                {activeWorkItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">المبلغ</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value)
                  setFormError(null)
                }}
                placeholder="مثال: 45"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">الوصف</span>
              <textarea
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  setFormError(null)
                }}
                placeholder="مثال: أجرة نقل مواد أو دفعة للورشة"
                rows={6}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to={backTo}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:border-slate-300"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={addExpenseMutation.isPending}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#50683f] px-6 text-sm font-extrabold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addExpenseMutation.isPending ? 'جاري إضافة المصروف...' : 'حفظ المصروف'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
