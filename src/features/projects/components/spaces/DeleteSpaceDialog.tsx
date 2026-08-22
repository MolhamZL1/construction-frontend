import { createPortal } from 'react-dom'

import type { ProjectSpace } from '../../models/project.model'
import { spaceTypeLabels } from '../../constants/project-spaces'
import { SpaceIcon } from './SpaceIcon'

interface DeleteSpaceDialogProps {
  space: ProjectSpace | null
  isOpen: boolean
  isDeleting: boolean
  errorMessage?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSpaceDialog({ space, isOpen, isDeleting, errorMessage, onClose, onConfirm }: DeleteSpaceDialogProps) {
  if (!isOpen || !space) return null

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/40 px-4" dir="rtl" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-[0_24px_70px_rgb(var(--color-brand-ink-rgb)/0.25)]">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <SpaceIcon name="warning" className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-900">حذف الفراغ؟</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              سيتم حذف فراغ <span className="font-extrabold text-slate-800">{spaceTypeLabels[space.type] ?? space.type}</span> من المشروع.
              لا يمكن التراجع عن هذه العملية بعد تنفيذها.
            </p>
          </div>
        </div>

        {errorMessage ? <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-rose-500 px-5 text-sm font-extrabold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
