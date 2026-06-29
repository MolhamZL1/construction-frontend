import { api } from '@/lib/axios'
import { getBrowserNotificationStatus, requestFcmToken } from '@/lib/firebase'

const LAST_SYNCED_FCM_TOKEN_KEY = 'cladding:last-synced-fcm-token'
const FCM_ENDPOINT = import.meta.env.VITE_FCM_TOKEN_ENDPOINT || '/fcm-token'
const FCM_FIELD = import.meta.env.VITE_FCM_TOKEN_FIELD || 'fcm_token'

export interface DeviceRegistrationResult {
  ok: boolean
  token: string | null
  reason?: 'not-available' | 'not-allowed' | 'missing-vapid-key' | 'sync-failed'
}

export async function sendFcmToken(fcmToken: string) {
  const formData = new FormData()
  formData.append(FCM_FIELD, fcmToken)

  await api.post(FCM_ENDPOINT, formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })

  if (import.meta.env.DEV) console.info('[FCM] Token sent to backend:', FCM_ENDPOINT)
}

export async function registerAuthenticatedDevice(options: { requestPermission?: boolean; forceSend?: boolean } = {}): Promise<DeviceRegistrationResult> {
  const status = getBrowserNotificationStatus()

  if (status === 'missing-vapid-key') return { ok: false, token: null, reason: 'missing-vapid-key' }
  if (status === 'denied') return { ok: false, token: null, reason: 'not-allowed' }

  const fcmToken = await requestFcmToken({ requestPermission: options.requestPermission ?? false })
  if (!fcmToken) return { ok: false, token: null, reason: 'not-available' }

  const lastSyncedToken = localStorage.getItem(LAST_SYNCED_FCM_TOKEN_KEY)
  if (!options.forceSend && lastSyncedToken === fcmToken) return { ok: true, token: fcmToken }

  try {
    await sendFcmToken(fcmToken)
    localStorage.setItem(LAST_SYNCED_FCM_TOKEN_KEY, fcmToken)
    return { ok: true, token: fcmToken }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[FCM] Failed to send token to backend:', error)
    return { ok: false, token: fcmToken, reason: 'sync-failed' }
  }
}

export async function registerDeviceAfterLogin() {
  // بعد تسجيل الدخول مباشرة نحاول إرسال التوكن.
  // إذا كان المستخدم سامح بالإشعارات سابقاً، رح ينرسل فوراً.
  // إذا أول مرة، رح نحاول طلب السماح، ولو المتصفح رفض الطلب التلقائي يبقى زر التفعيل بالهيدر موجود.
  return registerAuthenticatedDevice({ requestPermission: true, forceSend: true })
}

export function resetFcmTokenSyncCache() {
  localStorage.removeItem(LAST_SYNCED_FCM_TOKEN_KEY)
}
