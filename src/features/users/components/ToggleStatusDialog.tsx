import type { FormEvent } from 'react'
import { getUsersErrorMessage, useToggleUserStatus } from '../hooks/useUsers'
import type { User } from '../types/user.types'
import { getStatusLabel } from './StatusBadge'
import { DialogActions, DialogShell } from './UserFormDialog'

interface ToggleStatusDialogProps {
  user: User | null
  onClose: () => void
  onSuccess: (message: string) => void
}


export function ToggleStatusDialog({ user, onClose, onSuccess }: ToggleStatusDialogProps) {
  const toggleStatusMutation = useToggleUserStatus()

  if (!user) {
    return null
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user?.id) {
      return
    }

    try {
      const response = await toggleStatusMutation.mutateAsync(user.id)
      onSuccess(response.message || 'تم تغيير حالة المستخدم بنجاح')
      onClose()
    } catch {
      return
    }
  }

  const nextStatus = user.status === 'active' ? 'غير نشط' : 'نشط'
  const errorMessage = toggleStatusMutation.error ? getUsersErrorMessage(toggleStatusMutation.error) : null

  return (
    <DialogShell title="تغيير حالة المستخدم" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <p className="text-sm leading-6 text-slate-600">
          الحالة الحالية للمستخدم <span className="font-semibold text-slate-950">{user.name ?? '—'}</span> هي {getStatusLabel(user.status)}. هل تريد تغييرها إلى {nextStatus}؟
        </p>
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div> : null}
        <DialogActions onCancel={onClose} submitLabel={toggleStatusMutation.isPending ? 'جار الحفظ...' : 'تأكيد التغيير'} disabled={toggleStatusMutation.isPending} />
      </form>
    </DialogShell>
  )
}
