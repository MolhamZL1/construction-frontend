import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { BrandLockup } from '@/components/brand/BrandLockup'
import { registerFcmTokenAfterLogin } from '@/features/notifications/hooks/useFcmTokenRegistration'
import { useAuthStore } from '@/stores/authStore'

import { getLoginErrorMessage, useLoginCompany } from '../hooks/useLoginCompany'
import { isProjectManagerIdentifier, loginSchema, type LoginSchema } from '../schemas/login.schema'
import { getAuthenticatedHomePath, isInternalUser } from '../utils/auth-navigation'

interface RouterState {
  from?: {
    pathname?: string
  }
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m5 8 7 5 7-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      {hidden ? (
        <>
          <path d="M4 4l16 16" strokeLinecap="round" />
          <path
            d="M10.7 6.3A10.9 10.9 0 0 1 12 6c5.5 0 9 6 9 6a17.6 17.6 0 0 1-4.1 4.5M6.1 6.9C4.1 8.4 3 10.1 3 10.1s3.5 6 9 6c1.5 0 2.8-.3 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

const inputClassName =
  'auth-input h-14 w-full rounded-2xl border border-white/80 bg-[rgb(var(--color-white-rgb)/0.58)] px-12 text-sm font-bold text-[var(--color-brand-ink)] shadow-[inset_0_1px_0_rgb(var(--color-white-rgb)/0.9),0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.045)] outline-none backdrop-blur-xl transition placeholder:text-[rgb(var(--color-brand-stone-rgb)/0.58)] hover:bg-[rgb(var(--color-white-rgb)/0.68)] focus:border-[rgb(var(--color-brand-gold-rgb)/0.58)] focus:bg-[rgb(var(--color-white-rgb)/0.82)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const loginMutation = useLoginCompany()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginSchema) {
    const normalizedIdentifier = values.identifier.trim()
    const internalLogin = isProjectManagerIdentifier(normalizedIdentifier)

    try {
      const session = await loginMutation.mutateAsync(
        internalLogin
          ? {
              accountType: 'internal',
              internal_id: normalizedIdentifier,
              password: values.password,
            }
          : {
              accountType: 'company',
              email: normalizedIdentifier,
              password: values.password,
            },
      )

      setAuth(session.user, session.token)

      void registerFcmTokenAfterLogin({
        userId: session.user.id,
        accessToken: session.token,
        force: true,
      })

      const requestedPath = (location.state as RouterState | null)?.from?.pathname
      const nextPath = isInternalUser(session.user)
        ? getAuthenticatedHomePath(session.user)
        : (requestedPath ?? getAuthenticatedHomePath(session.user))

      navigate(nextPath, { replace: true })
    } catch {
      return
    }
  }

  const errorMessage = loginMutation.error ? getLoginErrorMessage(loginMutation.error) : null

  return (
    <section dir="rtl" className="relative z-10 w-full max-w-[470px] overflow-hidden rounded-[2.25rem] border border-white/75 bg-[rgb(var(--color-white-rgb)/0.52)] p-6 text-right shadow-[0_34px_100px_rgb(var(--color-brand-ink-rgb)/0.14)] backdrop-blur-[32px] sm:p-8 xl:p-9">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/60 blur-[54px]" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[rgb(var(--color-brand-gold-rgb)/0.13)] blur-[66px]" />

      <div className="relative">
        <header className="text-center">
          <BrandLockup
            orientation="horizontal"
            className="mx-auto"
            markClassName="h-12 w-12"
            wordmarkClassName="w-[112px]"
          />
          <div className="mx-auto mt-5 h-px w-14 bg-[linear-gradient(90deg,transparent,rgb(var(--color-brand-gold-rgb)/0.75),transparent)]" />
          <h1 className="mt-5 text-[32px] font-black leading-tight text-[var(--color-brand-ink)] sm:text-[36px]">تسجيل الدخول</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-7 text-[var(--color-brand-stone)]">
            أدخل بيانات حسابك للوصول إلى منصة إدارة مشاريع الإكساء.
          </p>
        </header>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <label htmlFor="identifier" className="block text-sm font-black text-[var(--color-brand-ink)]">
              البريد الإلكتروني أو المعرّف الداخلي
            </label>
            <div className="group relative">
              <span className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-12 items-center justify-center text-[var(--color-brand-stone)] transition group-focus-within:text-[var(--color-brand-gold)]">
                <MailIcon />
              </span>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="email@example.com / pm.username"
                dir="ltr"
                className={`${inputClassName} text-left`}
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                {...register('identifier')}
              />
            </div>
            {errors.identifier ? (
              <p id="identifier-error" role="alert" className="text-xs font-bold text-rose-600">
                {errors.identifier.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-black text-[var(--color-brand-ink)]">
              كلمة المرور
            </label>
            <div className="group relative">
              <span className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-12 items-center justify-center text-[var(--color-brand-stone)] transition group-focus-within:text-[var(--color-brand-gold)]">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${inputClassName} text-right`}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center text-[var(--color-brand-stone)] transition hover:text-[var(--color-brand-ink)]"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
            {errors.password ? (
              <p id="password-error" role="alert" className="text-xs font-bold text-rose-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {errorMessage ? (
            <div role="alert" className="rounded-2xl border border-rose-200/80 bg-rose-50/85 px-4 py-3 text-sm font-bold leading-6 text-rose-700 backdrop-blur-xl">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] text-base font-black text-white shadow-[0_16px_34px_rgb(var(--color-brand-ink-rgb)/0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--color-brand-ink-soft)] hover:shadow-[0_20px_38px_rgb(var(--color-brand-ink-rgb)/0.24)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-65"
          >
            {loginMutation.isPending ? (
              <span className="flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                جاري تسجيل الدخول
              </span>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
