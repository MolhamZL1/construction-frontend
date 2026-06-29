import { api } from '@/lib/axios'
import { requestFcmToken } from '@/lib/firebase'

const LAST_SYNCED_FCM_TOKEN_KEY = 'cladding:last-synced-fcm-token'
const FCM_ENDPOINT = import.meta.env.VITE_FCM_TOKEN_ENDPOINT || '/fcm-token'
const FCM_FIELD = import.meta.env.VITE_FCM_TOKEN_FIELD || 'fcm_token'

export interface DeviceRegistrationResult {
  ok: boolean
  token: string | null
  reason?: 'not-available' | 'not-allowed' | 'sync-failed'
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
}

export async function registerAuthenticatedDevice(options: { requestPermission?: boolean; forceSend?: boolean } = {}): Promise<DeviceRegistrationResult> {
  const fcmToken = await requestFcmToken({ requestPermission: options.requestPermission ?? false })
  if (!fcmToken) return { ok: false, token: null, reason: 'not-available' }

  const lastSyncedToken = localStorage.getItem(LAST_SYNCED_FCM_TOKEN_KEY)
  if (!options.forceSend && lastSyncedToken === fcmToken) return { ok: true, token: fcmToken }

  try {
    await sendFcmToken(fcmToken)
    localStorage.setItem(LAST_SYNCED_FCM_TOKEN_KEY, fcmToken)
    return { ok: true, token: fcmToken }
  } catch {
    return { ok: false, token: fcmToken, reason: 'sync-failed' }
  }
}
