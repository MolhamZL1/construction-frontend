import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getUsersErrorMessage, getValidationErrors, useCreateInternalUser } from '../hooks/useUsers'
import type { CreateUserPayload } from '../types/user.types'

const roleOptions: Array<{ value: CreateUserPayload['role']; label: string }> = [
  { value: 'project_manager', label: 'مدير مشروع' },
  { value: 'assistant', label: 'مساعد' },
  { value: 'project_owner', label: 'مالك مشروع' },
]

const schema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  role: z.enum(['project_manager', 'assistant', 'project_owner']),
})

interface UserFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

export function UserFormDialog({ open, onClose, onSuccess }: UserFormDialogProps) {
  const createUserMutation = useCreateInternalUser()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserPayload>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', password: '', role: 'project_manager' },
  })

  if (!open) {
    return null
  }

  async function onSubmit(values: CreateUserPayload) {
    try {
      const response = await createUserMutation.mutateAsync(values)
      reset()
      onSuccess(response.message || 'تمت إضافة المستخدم بنجاح')
      onClose()
    } catch {
      return
    }
  }

  const validationErrors = getValidationErrors(createUserMutation.error)
  const errorMessage = createUserMutation.error ? getUsersErrorMessage(createUserMutation.error) : null

  return (
    <DialogShell title="إضافة مستخدم" onClose={onClose}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم" error={errors.name?.message ?? validationErrors?.name?.[0]}>
            <input className={inputClass} type="text" autoComplete="name" {...register('name')} />
          </Field>
          
          <Field label="كلمة المرور" error={errors.password?.message ?? validationErrors?.password?.[0]}>
            <input className={inputClass} type="password" autoComplete="new-password" {...register('password')} />
          </Field>
          <Field label="الدور" error={errors.role?.message ?? validationErrors?.role?.[0]}>
            <select className={inputClass} {...register('role')}>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div> : null}

        <DialogActions
          onCancel={onClose}
          submitLabel={createUserMutation.isPending ? 'جار الحفظ...' : 'حفظ المستخدم'}
          disabled={createUserMutation.isPending}
        />
      </form>
    </DialogShell>
  )
}

export function DialogShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 text-right shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            aria-label="إغلاق"
          >
            إغلاق
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function DialogActions({ onCancel, submitLabel, disabled }: { onCancel: () => void; submitLabel: string; disabled?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-start">
      <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        إلغاء
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="h-10 rounded-xl bg-[var(--color-brand-ink)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitLabel}
      </button>
    </div>
  )
}

export const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]'

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-sm text-rose-600">{error}</span> : null}
    </label>
  )
}
