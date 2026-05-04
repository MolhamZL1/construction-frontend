import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getUsersErrorMessage, useCreateInternalUser } from '../hooks/useUsers'
import type { InternalUserRole } from '../models/user.model'

const roleOptions: Array<{ value: InternalUserRole; label: string }> = [
  { value: 'project_manager', label: 'مدير مشروع' },
  { value: 'assistant', label: 'مساعد' },
  { value: 'project_owner', label: 'مالك مشروع' },
]

const createUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(6, 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل'),
  role: z.enum(['project_manager', 'assistant', 'project_owner']),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>
const inputClass =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10'

interface CreateUserFormProps {
  onCreated?: () => void
}

export function CreateUserForm({ onCreated }: CreateUserFormProps) {
  const createUserMutation = useCreateInternalUser()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'project_manager',
    },
  })

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await createUserMutation.mutateAsync(values)
      reset()
      onCreated?.()
    } catch {
      return
    }
  }

  const errorMessage = createUserMutation.error ? getUsersErrorMessage(createUserMutation.error) : null

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="الاسم" error={errors.name?.message}>
          <input className={inputClass} type="text" placeholder="اسم المستخدم" {...register('name')} />
        </Field>

        <Field label="البريد الإلكتروني" error={errors.email?.message}>
          <input className={inputClass} type="email" dir="ltr" placeholder="user@example.com" {...register('email')} />
        </Field>

        <Field label="كلمة المرور" error={errors.password?.message}>
          <input className={inputClass} type="password" placeholder="••••••••" {...register('password')} />
        </Field>

        <Field label="الدور" error={errors.role?.message}>
          <select className={inputClass} {...register('role')}>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <button
        type="submit"
        disabled={createUserMutation.isPending}
        className="rounded-lg bg-[#50683f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {createUserMutation.isPending ? 'جاري الإضافة...' : 'حفظ المستخدم'}
      </button>
    </form>
  )
}

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block space-y-2 text-right">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-sm text-rose-600">{error}</span> : null}
    </label>
  )
}
