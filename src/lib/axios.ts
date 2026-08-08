import axios from 'axios'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/config/constants'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
  },
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getResponseMessage(data: unknown): string {
  if (typeof data === 'string') return data
  if (!isRecord(data)) return ''

  const message = data.message
  if (typeof message === 'string') return message

  const error = data.error
  if (typeof error === 'string') return error

  return ''
}

function getCurrentPath() {
  if (typeof window === 'undefined') return '/'
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function dispatchBrowserEvent(name: string, detail?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

function clearStoredAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  }

  useAuthStore.getState().logout()
}

function isUnauthenticatedError(error: unknown) {
  if (!axios.isAxiosError(error)) return false

  const status = error.response?.status
  const message = getResponseMessage(error.response?.data).toLowerCase()

  // 401/419 تعني أن الجلسة أو التوكن لم يعد صالحاً.
  if (status === 401 || status === 419) return true

  // 403 تعني أن المستخدم مسجل دخول، لكنه لا يملك صلاحية العملية.
  // لذلك لا نحذف الجلسة ولا ننفذ تسجيل خروج.
  if (status === 403) return false

  return status == null && message.includes('unauthenticated')
}

function isServerUnavailableError(error: unknown) {
  if (!axios.isAxiosError(error)) return false
  if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') return false

  const status = error.response?.status

  if (!error.response) return true
  return status === 502 || status === 503 || status === 504
}

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isUnauthenticatedError(error)) {
      clearStoredAuth()
      dispatchBrowserEvent('app:unauthenticated', {
        from: getCurrentPath(),
        reason: 'unauthenticated',
      })
    } else if (isServerUnavailableError(error)) {
      dispatchBrowserEvent('app:server-unavailable', {
        from: getCurrentPath(),
        reason: axios.isAxiosError(error) ? error.code || error.message : 'server_unavailable',
      })
    }

    return Promise.reject(error)
  },
)
