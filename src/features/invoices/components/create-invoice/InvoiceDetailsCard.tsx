import type { WorkItem } from '@/features/projects/models/project.model'
import { InvoiceIcon } from '../InvoiceIcon'

interface InvoiceDetailsCardProps {
  workItems: WorkItem[]
  workItemId: string
  supplierName: string
  notes: string
  onWorkItemChange: (value: string) => void
  onSupplierNameChange: (value: string) => void
  onNotesChange: (value: string) => void
}

export function InvoiceDetailsCard({
  workItems,
  workItemId,
  supplierName,
  notes,
  onWorkItemChange,
  onSupplierNameChange,
  onNotesChange,
}: InvoiceDetailsCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgb(var(--color-brand-ink-rgb)/0.07)]">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]"><InvoiceIcon name="file" /></span>
        <div>
          <h2 className="text-xl font-black text-slate-950">بيانات الفاتورة</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">اختر البند والمورد قبل إضافة المواد.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-right">
          <span className="text-sm font-extrabold text-slate-700">بند العمل *</span>
          <select
            value={workItemId}
            onChange={(event) => onWorkItemChange(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
          >
            <option value="">اختر بند العمل</option>
            {workItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>

        <label className="space-y-2 text-right">
          <span className="text-sm font-extrabold text-slate-700">اسم المورد *</span>
          <input
            value={supplierName}
            onChange={(event) => onSupplierNameChange(event.target.value)}
            placeholder="مثال: شركة الإسمنت المتحدة"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
          />
        </label>

        <label className="space-y-2 text-right md:col-span-2">
          <span className="text-sm font-extrabold text-slate-700">ملاحظات</span>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="ملاحظات اختيارية للفاتورة..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
          />
        </label>
      </div>
    </div>
  )
}
