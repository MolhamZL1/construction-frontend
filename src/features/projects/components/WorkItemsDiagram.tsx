import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { LoadingState } from '@/components/ui'
import {
  getProjectsErrorMessage,
  useReorderWorkItems,
  useUpdateWorkItem,
} from '../hooks/useProjects'
import type { QualityLevel, WorkItem } from '../models/project.model'

const qualityOptions: Array<{ value: QualityLevel; label: string }> = [
  { value: 'basic', label: 'عادي' },
  { value: 'good', label: 'جيد' },
  { value: 'premium', label: 'ممتاز' },
]

const qualityLabels: Record<string, string> = {
  basic: 'عادي',
  good: 'جيد',
  premium: 'ممتاز',
  custom: 'مخصص',
}

const selectClass =
  'h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10'

interface WorkItemsDiagramProps {
  projectId: string
  workItems: WorkItem[]
  isLoading: boolean
  className?: string
}

interface DragState {
  id: string
  x: number
  y: number
  offsetX: number
  offsetY: number
  width: number
}

export function WorkItemsDiagram({ projectId, workItems, isLoading, className = '' }: WorkItemsDiagramProps) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [hoveredSortOrder, setHoveredSortOrder] = useState<number | null>(null)
  const [sortOrderOverrides, setSortOrderOverrides] = useState<Record<string, number>>({})
  const columnRefs = useRef(new Map<number, HTMLDivElement>())
  const reorderMutation = useReorderWorkItems()
  const updateMutation = useUpdateWorkItem()

  const displayedItems = useMemo(
    () =>
      workItems.map((item) => ({
        ...item,
        sortOrder: sortOrderOverrides[item.id] ?? item.sortOrder,
      })),
    [sortOrderOverrides, workItems]
  )

  const orderedItems = useMemo(
    () => [...displayedItems].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ar')),
    [displayedItems]
  )

  const draggedItem = useMemo(
    () => (dragState ? displayedItems.find((item) => item.id === dragState.id) : undefined),
    [displayedItems, dragState]
  )

  const columns = useMemo(() => {
    const visibleItems = dragState ? orderedItems.filter((item) => item.id !== dragState.id) : orderedItems
    const visibleSortOrders = [...new Set(visibleItems.map((item) => item.sortOrder))].sort((a, b) => a - b)
    const maxOrder = Math.max(1, ...orderedItems.map((item) => item.sortOrder), ...visibleSortOrders)
    const sortOrders = visibleSortOrders.length > 0 ? visibleSortOrders : [draggedItem?.sortOrder ?? 1]
    const newTargetOrder = maxOrder + 1

    return [...sortOrders, newTargetOrder].map((sortOrder) => {
      return {
        sortOrder,
        items: visibleItems.filter((item) => item.sortOrder === sortOrder),
        isEmptyTarget: sortOrder === newTargetOrder,
      }
    })
  }, [dragState, draggedItem?.sortOrder, orderedItems])

  useEffect(() => {
    setSortOrderOverrides((current) => {
      const next = { ...current }

      for (const item of workItems) {
        if (next[item.id] === item.sortOrder) {
          delete next[item.id]
        }
      }

      return next
    })
  }, [workItems])

  useEffect(() => {
    if (!dragState) return

    function handlePointerMove(event: globalThis.PointerEvent) {
      setDragState((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : current))
      setHoveredSortOrder(getNearestSortOrder(event.clientX, event.clientY))
    }

    function handlePointerUp(event: globalThis.PointerEvent) {
      finishDragAt(event.clientX, event.clientY)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', cancelDrag)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', cancelDrag)
    }
  }, [dragState])

  function setColumnRef(sortOrder: number, element: HTMLDivElement | null) {
    if (element) {
      columnRefs.current.set(sortOrder, element)
    } else {
      columnRefs.current.delete(sortOrder)
    }
  }

  function getNearestSortOrder(clientX: number, clientY: number): number | null {
    let nearestSortOrder: number | null = null
    let nearestDistance = Infinity

    for (const [sortOrder, element] of columnRefs.current.entries()) {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = clientX - centerX
      const dy = clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestSortOrder = sortOrder
      }
    }

    return nearestSortOrder
  }

  function beginDrag(event: PointerEvent<HTMLElement>, item: WorkItem) {
    const target = event.target as HTMLElement
    if (target.closest('select, input, button')) return

    const rect = event.currentTarget.getBoundingClientRect()
    event.preventDefault()
    setDragState({
      id: item.id,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
    })
    setHoveredSortOrder(item.sortOrder)
  }

  function finishDragAt(clientX: number, clientY: number) {
    if (!dragState) return

    const item = displayedItems.find((entry) => entry.id === dragState.id)
    const nextSortOrder = getNearestSortOrder(clientX, clientY)
    setHoveredSortOrder(null)
    setDragState(null)

    if (!item || !nextSortOrder || nextSortOrder === item.sortOrder) return

    setSortOrderOverrides((current) => ({ ...current, [item.id]: nextSortOrder }))

    reorderMutation.mutate({
      projectId,
      items: [{ id: item.id, sortOrder: nextSortOrder }],
    }, {
      onError: () => {
        setSortOrderOverrides((current) => {
          const next = { ...current }
          delete next[item.id]
          return next
        })
      },
    })
  }

  function cancelDrag() {
    setDragState(null)
    setHoveredSortOrder(null)
  }

  function updateItem(item: WorkItem, values: { qualityLevel?: QualityLevel; isActive?: boolean }) {
    updateMutation.mutate({
      projectId,
      workItemId: item.id,
      qualityLevel: values.qualityLevel,
      isActive: values.isActive,
    })
  }

  const mutationError = reorderMutation.error ?? updateMutation.error

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">بنود العمل</h3>
          <p className="mt-1 text-xs text-slate-500">اسحب العقدة داخل المساحة البيضاء إلى رقم الترتيب المطلوب.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {orderedItems.length} بند
        </div>
      </div>

      {mutationError ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getProjectsErrorMessage(mutationError)}
        </div>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        {isLoading ? <LoadingState label="جاري تحميل البنود..." compact className="border-0 shadow-none" /> : null}

        {!isLoading && orderedItems.length > 0 ? (
          <div className="relative min-h-[560px] min-w-max p-8" dir="rtl">
            <div className="pointer-events-none absolute inset-x-10 top-24 h-px bg-slate-200" />

            <div className="relative z-10 flex items-start gap-8">
              {columns.map((column, columnIndex) => (
                <div key={column.sortOrder} className="flex items-start gap-8">
                  <div
                    ref={(element) => setColumnRef(column.sortOrder, element)}
                    className={`min-h-[470px] w-72 rounded-2xl border-2 bg-white p-4 transition ${
                      hoveredSortOrder === column.sortOrder
                        ? 'border-[#50683f] shadow-[0_16px_40px_rgba(80,104,63,0.16)]'
                        : 'border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="mb-5 flex items-center justify-between gap-2">
                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[#50683f] px-3 text-sm font-bold text-white">
                        {column.sortOrder}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        {column.isEmptyTarget ? 'ترتيب جديد' : `${column.items.length} بند`}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {column.items.map((item) => {
                        return (
                          <article
                            key={item.id}
                            onPointerDown={(event) => beginDrag(event, item)}
                            className={`relative touch-none select-none rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#50683f]/50 hover:shadow-md ${
                              item.isActive ? 'cursor-grab' : 'cursor-grab opacity-60'
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-bold text-slate-900">{item.name}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {qualityLabels[item.qualityLevel] ?? item.qualityLevel} · {item.durationDays ?? '-'} أيام
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {item.isActive ? 'فعال' : 'غير فعال'}
                              </span>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                              <select
                                className={selectClass}
                                value={item.qualityLevel}
                                onChange={(event) => updateItem(item, { qualityLevel: event.target.value as QualityLevel })}
                                disabled={updateMutation.isPending || reorderMutation.isPending}
                                aria-label="نوع البند"
                              >
                                {!qualityOptions.some((option) => option.value === item.qualityLevel) ? (
                                  <option value={item.qualityLevel}>{qualityLabels[item.qualityLevel] ?? item.qualityLevel}</option>
                                ) : null}
                                {qualityOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>

                              <select
                                className={selectClass}
                                value={item.isActive ? 'active' : 'inactive'}
                                onChange={(event) => updateItem(item, { isActive: event.target.value === 'active' })}
                                disabled={updateMutation.isPending || reorderMutation.isPending}
                                aria-label="حالة البند"
                              >
                                <option value="active">فعال</option>
                                <option value="inactive">غير فعال</option>
                              </select>
                            </div>
                          </article>
                        )
                      })}

                      {column.items.length === 0 ? (
                        <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs text-slate-400">
                          اسحب بنداً إلى هنا
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {columnIndex < columns.length - 1 ? (
                    <div className="mt-20 flex w-14 items-center justify-center text-slate-300">
                      <svg className="h-7 w-14 rtl:rotate-180" viewBox="0 0 56 28" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 14h40" strokeLinecap="round" />
                        <path d="m36 7 8 7-8 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {dragState && draggedItem ? (
              <article
                className="pointer-events-none fixed z-50 touch-none select-none rounded-xl border border-[#50683f] bg-white p-4 shadow-2xl"
                style={{
                  left: dragState.x - dragState.offsetX,
                  top: dragState.y - dragState.offsetY,
                  width: dragState.width,
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-slate-900">{draggedItem.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {qualityLabels[draggedItem.qualityLevel] ?? draggedItem.qualityLevel} · {draggedItem.durationDays ?? '-'} أيام
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      draggedItem.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {draggedItem.isActive ? 'فعال' : 'غير فعال'}
                  </span>
                </div>
              </article>
            ) : null}
          </div>
        ) : null}

        {!isLoading && orderedItems.length === 0 ? (
          <div className="m-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-sm text-slate-500">
            لا توجد بنود عمل.
          </div>
        ) : null}
      </div>
    </section>
  )
}
