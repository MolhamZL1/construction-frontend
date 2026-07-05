import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { registerFcmTokenAfterLogin } from '@/features/notifications/hooks/useFcmTokenRegistration'
import { getLoginErrorMessage, useLoginCompany } from '../hooks/useLoginCompany'
import { loginSchema, type LoginSchema } from '../schemas/login.schema'

interface RouterState {
  from?: {
    pathname?: string
  }
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const loginMutation = useLoginCompany()
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      accountType: 'company',
      email: '',
      internal_id: '',
      password: '',
    },
  })
  const accountType = watch('accountType')

  async function onSubmit(values: LoginSchema) {
    try {
      const session = await loginMutation.mutateAsync(
        values.accountType === 'internal'
          ? {
              accountType: 'internal',
              internal_id: values.internal_id?.trim() ?? '',
              password: values.password,
            }
          : {
              accountType: 'company',
              email: values.email?.trim() ?? '',
              password: values.password,
            }
      )
      setAuth(session.user, session.token)

      void registerFcmTokenAfterLogin({
        userId: session.user.id,
        accessToken: session.token,
        force: true,
      })

      const nextPath =
        values.accountType === 'internal'
          ? '/projects'
          : ((location.state as RouterState | null)?.from?.pathname ?? '/dashboard')
      navigate(nextPath, { replace: true })
    } catch {
      return
    }
  }

  const errorMessage = loginMutation.error ? getLoginErrorMessage(loginMutation.error) : null

  return (
    <div className="w-full max-w-[720px] px-6 py-8 sm:px-8 lg:px-12 xl:px-16">
      <div className="space-y-2 text-right">
        <h2 className="text-3xl font-bold tracking-normal text-slate-900 sm:text-4xl lg:text-[42px]">تسجيل الدخول</h2>
        <p className="text-base leading-7 text-slate-500 sm:text-lg lg:text-xl">مرحباً بك، أدخل بياناتك للوصول إلى حسابك</p>
      </div>

      <form className="mt-10 space-y-5 sm:mt-12 sm:space-y-6 lg:mt-14" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-1.5">
          <label
            className={`flex h-12 cursor-pointer items-center justify-center rounded-xl text-base font-semibold transition sm:h-14 sm:text-lg ${
              accountType === 'company'
                ? 'bg-white text-[#50683f] shadow-sm ring-1 ring-[#5e7247]/15'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <input type="radio" value="company" className="sr-only" {...register('accountType')} />
            مدير الشركة
          </label>

          <label
            className={`flex h-12 cursor-pointer items-center justify-center rounded-xl text-base font-semibold transition sm:h-14 sm:text-lg ${
              accountType === 'internal'
                ? 'bg-white text-[#50683f] shadow-sm ring-1 ring-[#5e7247]/15'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <input type="radio" value="internal" className="sr-only" {...register('accountType')} />
            مهندس
          </label>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <label htmlFor={accountType === 'internal' ? 'internal_id' : 'email'} className="block text-right text-base font-medium text-slate-800 sm:text-lg lg:text-xl">
            {accountType === 'internal' ? 'المعرّف الداخلي' : 'البريد الإلكتروني'}
          </label>
          {accountType === 'internal' ? (
            <>
              <input
                id="internal_id"
                type="text"
                autoComplete="username"
                placeholder="pm.ahmad@alfanar"
                dir="ltr"
                className="h-14 w-full rounded-2xl border border-transparent bg-slate-50 px-5 text-right text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5e7247]/30 focus:bg-white focus:ring-4 focus:ring-[#5e7247]/10 sm:h-16 sm:px-6 sm:text-lg lg:text-xl"
                {...register('internal_id')}
              />
              {errors.internal_id ? <p className="text-right text-sm text-rose-600">{errors.internal_id.message}</p> : null}
            </>
          ) : (
            <>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                dir="ltr"
                className="h-14 w-full rounded-2xl border border-transparent bg-slate-50 px-5 text-right text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5e7247]/30 focus:bg-white focus:ring-4 focus:ring-[#5e7247]/10 sm:h-16 sm:px-6 sm:text-lg lg:text-xl"
                {...register('email')}
              />
              {errors.email ? <p className="text-right text-sm text-rose-600">{errors.email.message}</p> : null}
            </>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          <label htmlFor="password" className="block text-right text-base font-medium text-slate-800 sm:text-lg lg:text-xl">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-14 w-full rounded-2xl border border-transparent bg-slate-50 px-5 pe-16 text-right text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5e7247]/30 focus:bg-white focus:ring-4 focus:ring-[#5e7247]/10 sm:h-16 sm:px-6 sm:pe-20 sm:text-lg lg:text-xl"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 left-0 flex w-14 items-center justify-center text-slate-500 transition hover:text-slate-700 sm:w-16"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  d={
                    showPassword
                      ? 'M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z'
                      : 'M4 4l16 16M10.7 6.3A10.9 10.9 0 0 1 12 6c5.5 0 9 6 9 6a17.6 17.6 0 0 1-4.1 4.5M6.1 6.9C4.1 8.4 3 10.1 3 10.1s3.5 6 9 6c1.5 0 2.8-.3 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2'
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          {errors.password ? <p className="text-right text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-right text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#5b7146] px-4 text-lg font-medium text-white transition hover:bg-[#4f633d] disabled:cursor-not-allowed disabled:bg-slate-400 sm:h-16 sm:text-xl"
        >
          {loginMutation.isPending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>

        <div className="border-t border-slate-200 pt-4 sm:pt-6" />
      </form>
    </div>
  )
}
