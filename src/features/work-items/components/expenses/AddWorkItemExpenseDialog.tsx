import { useEffect, useState, type FormEvent } from 'react'

import { getWorkItemExpensesErrorMessage } from '../../api/work-item-expenses.api'
import { useCreateWorkItemExpense } from '../../hooks/useWorkItemExpenses'
import { WorkItemIcon } from '../WorkItemIcon'

interface ExpenseWorkItemOption {
  id: string
  name: string
}

interface AddWorkItemExpenseDialogProps {
  open: boolean
  projectId: string
  workItems: ExpenseWorkItemOption[]
  initialWorkItemId?: string
  lockWorkItem?: boolean
  onClose: () => void
  onCreated?: (workItemId: string) => void
}

export function AddWorkItemExpenseDialog({
  open,
  projectId,
  workItems,
  initialWorkItemId = '',
  lockWorkItem = false,
  onClose,
  onCreated,
}: AddWorkItemExpenseDialogProps) {
  const firstWorkItemId = workItems[0]?.id ?? ''
  const [workItemId, setWorkItemId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const createExpenseMutation = useCreateWorkItemExpense()
  useEffect(() => {
    if (!open) return

    createExpenseMutation.reset()
    setWorkItemId(initialWorkItemId || firstWorkItemId)
    setAmount('')
    setDescription('')
  }, [firstWorkItemId, initialWorkItemId, open])

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !createExpenseMutation.isPending) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [createExpenseMutation.isPending, onClose, open])

  if (!open) return null

  const numericAmount = Number(amount)
  const canSubmit = Boolean(
    projectId &&
      workItemId &&
      description.trim() &&
      Number.isFinite(numericAmount) &&
      numericAmount > 0 &&
      !createExpenseMutation.isPending,
  )

  const errorMessage = createExpenseMutation.isError
    ? getWorkItemExpensesErrorMessage(createExpenseMutation.error)
    : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    try {
      await createExpenseMutation.mutateAsync({
        projectId,
        workItemId,
        amount,
        description: description.trim(),
      })

      onCreated?.(workItemId)
      onClose()
    } catch {
      return
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" dir="rtl">
      <button
        type="button"
        aria-label="إغلاق النافذة"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        disabled={createExpenseMutation.isPending}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-work-item-expense-title"
        className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgb(var(--color-brand-ink-rgb)/0.24)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="add-work-item-expense-title" className="text-xl font-black text-slate-950">
              إضافة تكلفة أو أجرة ورشة
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              سجّل المبلغ على بند العمل المناسب.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createExpenseMutation.isPending}
            title="إغلاق"
            aria-label="إغلاق"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <WorkItemIcon name="x" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {lockWorkItem ? null : (
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">بند العمل</span>
              <select
                value={workItemId}
                onChange={(event) => setWorkItemId(event.target.value)}
                disabled={createExpenseMutation.isPending}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)] disabled:bg-slate-50"
              >
                <option value="">اختر بند العمل</option>
                {workItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">المبلغ ($)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={createExpenseMutation.isPending}
              placeholder="مثال: 45000"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)] disabled:bg-slate-50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">الوصف</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={createExpenseMutation.isPending}
              rows={4}
              placeholder="مثال: أجرة الورشة أو طعام العمال"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-800 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)] disabled:bg-slate-50"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={createExpenseMutation.isPending}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-6 text-sm font-black text-white shadow-[0_8px_18px_rgb(var(--color-brand-gold-rgb)/0.22)] transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <WorkItemIcon name="add" className="h-4 w-4" />
              {createExpenseMutation.isPending ? 'جاري الحفظ...' : 'إضافة التكلفة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
