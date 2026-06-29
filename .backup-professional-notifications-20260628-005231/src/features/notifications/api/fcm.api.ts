import { env } from '@/config/env'
import { api } from '@/lib/axios'
import { requestFcmToken } from '@/lib/firebase'

const LAST_SYNCED_FCM_TOKEN_KEY = 'cladding:last-synced-fcm-token'

export async function sendFcmToken(fcmToken: string) {
  const formData = new FormData()
  formData.append(env.FCM_TOKEN_FIELD, fcmToken)

  await api.post(env.FCM_TOKEN_ENDPOINT, formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function registerAuthenticatedDevice(options: { requestPermission?: boolean; forceSend?: boolean } = {}) {
  const fcmToken = await requestFcmToken({ requestPermission: options.requestPermission ?? false })
  if (!fcmToken) return null

  const lastSyncedToken = localStorage.getItem(LAST_SYNCED_FCM_TOKEN_KEY)
  if (!options.forceSend && lastSyncedToken === fcmToken) return fcmToken

  await sendFcmToken(fcmToken)
  localStorage.setItem(LAST_SYNCED_FCM_TOKEN_KEY, fcmToken)

  return fcmToken
}
