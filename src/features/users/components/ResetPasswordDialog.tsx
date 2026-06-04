import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getUsersErrorMessage, getValidationErrors, useResetUserPassword } from '../hooks/useUsers'
import type { ResetPasswordPayload, User } from '../types/user.types'
import { DialogActions, DialogShell, inputClass } from './UserFormDialog'

const schema = z.object({
  admin_password: z.string().min(1, 'كلمة مرور المسؤول مطلوبة'),
  new_password: z.string().min(1, 'كلمة المرور الجديدة مطلوبة'),
})

interface ResetPasswordDialogProps {
  user: User | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function ResetPasswordDialog({ user, onClose, onSuccess }: ResetPasswordDialogProps) {
  const resetPasswordMutation = useResetUserPassword()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordPayload>({
    resolver: zodResolver(schema),
    defaultValues: { admin_password: '', new_password: '' },
  })

  if (!user) {
    return null
  }

  async function onSubmit(values: ResetPasswordPayload) {
    if (!user?.id) {
      return
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({ userId: user.id, payload: values })
      reset()
      onSuccess(response.message || 'تم تحديث كلمة المرور بنجاح')
      onClose()
    } catch {
      reset({ admin_password: '', new_password: '' })
    }
  }

  const validationErrors = getValidationErrors(resetPasswordMutation.error)
  const errorMessage = resetPasswordMutation.error ? getUsersErrorMessage(resetPasswordMutation.error) : null

  return (
    <DialogShell title="إعادة تعيين كلمة المرور" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="text-sm leading-6 text-slate-600">إعادة تعيين كلمة مرور المستخدم <span className="font-semibold text-slate-950">{user.name ?? '—'}</span></p>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">كلمة مرور المسؤول</span>
          <input className={inputClass} type="password" autoComplete="current-password" {...register('admin_password')} />
          {errors.admin_password?.message || validationErrors?.admin_password?.[0] ? <span className="block text-sm text-rose-600">{errors.admin_password?.message ?? validationErrors?.admin_password?.[0]}</span> : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">كلمة المرور الجديدة</span>
          <input className={inputClass} type="password" autoComplete="new-password" {...register('new_password')} />
          {errors.new_password?.message || validationErrors?.new_password?.[0] ? <span className="block text-sm text-rose-600">{errors.new_password?.message ?? validationErrors?.new_password?.[0]}</span> : null}
        </label>
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div> : null}
        <DialogActions onCancel={onClose} submitLabel={resetPasswordMutation.isPending ? 'جار التحديث...' : 'تحديث كلمة المرور'} disabled={resetPasswordMutation.isPending} />
      </form>
    </DialogShell>
  )
}
