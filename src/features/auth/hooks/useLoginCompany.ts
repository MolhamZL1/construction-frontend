import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { login, signOut } from '../api/auth.api'
import type { LoginFormValues } from '../types/auth.types'

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

function resolveErrorMessage(error: AxiosError<ApiErrorResponse>) {
  const firstFieldError = error.response?.data?.errors
    ? Object.values(error.response.data.errors)[0]?.[0]
    : null

  const apiMessage = error.response?.data?.message
  const status = error.response?.status

  if (firstFieldError) {
    return firstFieldError
  }

  if (status === 401) {
    return 'بيانات الدخول غير صحيحة.'
  }

  if (status === 422) {
    return 'البيانات المدخلة غير صالحة. تحقق منها ثم أعد المحاولة.'
  }

  if (status && status >= 500) {
    return 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.'
  }

  if (apiMessage) {
    return 'تعذر تسجيل الدخول. تحقق من البيانات ثم أعد المحاولة.'
  }

  return 'تعذر تسجيل الدخول. تحقق من البيانات وحاول مجددًا.'
}

export function useLoginCompany() {
  return useMutation({
    mutationFn: (payload: LoginFormValues) => login(payload),
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
  })
}

export function getLoginErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return resolveErrorMessage(error)
  }

  return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
}
