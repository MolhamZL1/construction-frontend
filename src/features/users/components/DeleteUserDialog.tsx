import type { FormEvent } from 'react'
import { getUsersErrorMessage, useDeleteUser } from '../hooks/useUsers'
import type { User } from '../types/user.types'
import { DialogActions, DialogShell } from './UserFormDialog'

interface DeleteUserDialogProps {
  user: User | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function DeleteUserDialog({ user, onClose, onSuccess }: DeleteUserDialogProps) {
  const deleteUserMutation = useDeleteUser()

  if (!user) {
    return null
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user?.id) {
      return
    }

    try {
      const response = await deleteUserMutation.mutateAsync(user.id)
      onSuccess(response.message || 'تم حذف المستخدم بنجاح')
      onClose()
    } catch {
      return
    }
  }

  const errorMessage = deleteUserMutation.error ? getUsersErrorMessage(deleteUserMutation.error) : null

  return (
    <DialogShell title="حذف المستخدم" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <p className="text-sm leading-6 text-slate-600">
          هل تريد حذف <span className="font-semibold text-slate-950">{user.name ?? 'هذا المستخدم'}</span>
          {user.internal_id ? <span> ({user.internal_id})</span> : null}؟
        </p>
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div> : null}
        <DialogActions onCancel={onClose} submitLabel={deleteUserMutation.isPending ? 'جار الحذف...' : 'حذف المستخدم'} disabled={deleteUserMutation.isPending} />
      </form>
    </DialogShell>
  )
}
