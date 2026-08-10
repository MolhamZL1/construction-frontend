import type { Material } from '../models/material.model'
import { MaterialIcon } from './MaterialIcon'

interface DeleteMaterialDialogProps {
  material: Material | null
  isDeleting: boolean
  errorMessage?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteMaterialDialog({ material, isDeleting, errorMessage, onClose, onConfirm }: DeleteMaterialDialogProps) {
  if (!material) return null

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/40 px-4" dir="rtl">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <MaterialIcon name="delete" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-950">حذف المادة</h2>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
              هل تريد حذف مادة <span className="font-black text-slate-950">{material.name}</span>؟ لا يمكن التراجع عن هذه العملية.
            </p>
          </div>
        </div>

        {errorMessage ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  )
}
