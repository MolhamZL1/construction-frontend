import { useEffect, useMemo, useState } from 'react'
import type { WorkItem } from '../models/work-item.model'
import { getWorkItemsErrorMessage, useReorderWorkItems } from '../hooks/useWorkItems'
import { WorkItemIcon } from './WorkItemIcon'

interface ReorderWorkItemsPanelProps {
  projectId: string
  items: WorkItem[]
  disabled?: boolean
}

export function ReorderWorkItemsPanel({ projectId, items, disabled = false }: ReorderWorkItemsPanelProps) {
  const reorderMutation = useReorderWorkItems()
  const reorderableItems = useMemo(
    () => items.filter((item) => item.isActive && item.status !== 'completed').sort((a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id)),
    [items]
  )

  const [orders, setOrders] = useState<Record<string, number>>({})

  useEffect(() => {
    setOrders(Object.fromEntries(reorderableItems.map((item) => [item.id, item.sortOrder])))
  }, [reorderableItems])

  const hasChanges = reorderableItems.some((item) => Number(orders[item.id]) !== item.sortOrder)

  function handleSave() {
    reorderMutation.mutate({
      projectId,
      items: reorderableItems.map((item) => ({ id: item.id, sortOrder: Number(orders[item.id] ?? item.sortOrder) })),
    })
  }

  if (reorderableItems.length === 0) return null

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <WorkItemIcon name="reorder" className="h-5 w-5 text-[#50683f]" />
            <h2 className="text-lg font-black text-slate-900">ترتيب البنود والتبعيات</h2>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            يمكن وجود بندين بنفس الترتيب إذا كان النظام يسمح بذلك. عند الحفظ، الـ API هو الذي يقرر إذا كان الترتيب صالحاً حسب التبعيات.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || !hasChanges || reorderMutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <WorkItemIcon name="save" className="h-5 w-5" />
          {reorderMutation.isPending ? 'جاري الحفظ...' : 'حفظ الترتيب'}
        </button>
      </div>

      {reorderMutation.error ? (
        <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {getWorkItemsErrorMessage(reorderMutation.error)}
        </div>
      ) : null}

      {reorderMutation.isSuccess ? (
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم حفظ الترتيب بنجاح.</div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reorderableItems.map((item) => (
          <label key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
            <span className="min-w-0 truncate text-sm font-black text-slate-800">{item.name}</span>
            <input
              type="number"
              min="1"
              value={orders[item.id] ?? item.sortOrder}
              disabled={disabled || reorderMutation.isPending}
              onChange={(event) => setOrders((current) => ({ ...current, [item.id]: Number(event.target.value) }))}
              className="h-10 w-24 rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-black text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10 disabled:bg-slate-100"
            />
          </label>
        ))}
      </div>
    </section>
  )
}
