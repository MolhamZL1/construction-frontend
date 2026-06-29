import { useEffect, useMemo, useState } from 'react'
import { getMaterialUnitLabel } from '../constants/material-units'
import type { Material, SystemWorkItem } from '../models/material.model'
import { MaterialIcon } from './MaterialIcon'

interface MaterialWorkItemsDialogProps {
  material: Material | null
  workItems: SystemWorkItem[]
  linkedNames: string[]
  isLoadingWorkItems: boolean
  isLoadingLinks: boolean
  isAttaching: boolean
  isDetaching: boolean
  attachErrorMessage?: string | null
  detachErrorMessage?: string | null
  onClose: () => void
  onAttach: (workItemName: string) => void
  onDetach: (workItemName: string) => void
}

export function MaterialWorkItemsDialog({
  material,
  workItems,
  linkedNames,
  isLoadingWorkItems,
  isLoadingLinks,
  isAttaching,
  isDetaching,
  attachErrorMessage,
  detachErrorMessage,
  onClose,
  onAttach,
  onDetach,
}: MaterialWorkItemsDialogProps) {
  const [selectedWorkItemName, setSelectedWorkItemName] = useState('')

  useEffect(() => {
    setSelectedWorkItemName('')
  }, [material?.id])

  const availableWorkItems = useMemo(
    () => workItems.filter((workItem) => !linkedNames.includes(workItem.name)),
    [linkedNames, workItems]
  )

  if (!material) return null

  function handleAttach() {
    if (!selectedWorkItemName) return
    onAttach(selectedWorkItemName)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6" dir="rtl">
      <section className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white text-right shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <header className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
              <MaterialIcon name="link" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-950">ربط المادة ببند</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{material.name} • {getMaterialUnitLabel(material.unit)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            إغلاق
          </button>
        </header>

        <div className="space-y-6 p-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-black text-slate-900">البنود المرتبطة حالياً</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">يمكن فك الربط من نفس النافذة.</p>

            {isLoadingLinks ? <p className="mt-4 text-sm font-bold text-slate-500">جاري تحديث الارتباطات...</p> : null}

            {!isLoadingLinks && linkedNames.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                هذه المادة غير مرتبطة بأي بند حالياً.
              </div>
            ) : null}

            {!isLoadingLinks && linkedNames.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {linkedNames.map((name) => (
                  <span key={name} className="inline-flex items-center gap-2 rounded-2xl border border-[#50683f]/15 bg-[#eef4eb] px-3 py-2 text-xs font-black text-[#50683f]">
                    {name}
                    <button
                      type="button"
                      onClick={() => onDetach(name)}
                      disabled={isDetaching}
                      className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      title="فك الربط"
                    >
                      فك الربط
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {detachErrorMessage ? <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{detachErrorMessage}</div> : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-black text-slate-900">إضافة ربط جديد</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">اختر بنداً من البنود الافتراضية في النظام.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">البند</span>
                <select
                  value={selectedWorkItemName}
                  onChange={(event) => setSelectedWorkItemName(event.target.value)}
                  disabled={isLoadingWorkItems || isAttaching || availableWorkItems.length === 0}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">{isLoadingWorkItems ? 'جاري تحميل البنود...' : 'اختر البند'}</option>
                  {availableWorkItems.map((workItem) => (
                    <option key={workItem.name} value={workItem.name}>{workItem.name}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleAttach}
                disabled={!selectedWorkItemName || isAttaching}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#405433] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MaterialIcon name="link" className="h-4 w-4" />
                {isAttaching ? 'جاري الربط...' : 'ربط المادة'}
              </button>
            </div>

            {!isLoadingWorkItems && availableWorkItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                المادة مرتبطة بكل البنود المتاحة حالياً.
              </div>
            ) : null}

            {attachErrorMessage ? <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{attachErrorMessage}</div> : null}
          </div>
        </div>
      </section>
    </div>
  )
}
