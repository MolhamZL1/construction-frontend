import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { getWorkItemsErrorMessage, useActivateWorkItem, useWorkItems } from '../hooks/useWorkItems'
import { normalizeQuality, normalizeStatus } from '../utils/work-items-formatters'

export function InactiveWorkItemsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const itemsQuery = useWorkItems(projectId)
  const activateMutation = useActivateWorkItem()
  const inactiveItems = (itemsQuery.data ?? []).filter((item) => !item.isActive)
  const error = itemsQuery.error || activateMutation.error

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <Link to={`/projects/${projectId}/work-items`} className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)]">
            العودة إلى بنود العمل
          </Link>
        </div>

        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)]">
          <h1 className="text-3xl font-black text-slate-900">البنود غير المفعلة</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">يمكن إعادة تفعيل البنود التي تم إلغاؤها من المشروع.</p>
        </header>

        {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{getWorkItemsErrorMessage(error)}</div> : null}

        {itemsQuery.isLoading ? <LoadingState label="جاري تحميل البنود غير المفعلة..." /> : null}

        {!itemsQuery.isLoading && inactiveItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">لا يوجد بنود غير مفعلة.</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inactiveItems.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">{item.name}</h2>
              <div className="mt-3 space-y-1 text-sm font-semibold text-slate-500">
                <p>الترتيب: {item.sortOrder}</p>
                <p>الجودة: {normalizeQuality(item.qualityLevel)}</p>
                <p>الحالة: {normalizeStatus(item.status)}</p>
              </div>
              <button
                type="button"
                onClick={() => activateMutation.mutate({ projectId, workItemId: item.id })}
                disabled={activateMutation.isPending}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] px-4 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
              >
                إعادة التفعيل
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
