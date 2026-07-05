import { env } from '@/config/env'
import { api } from '@/lib/axios'

export interface SendFcmTokenOptions {
  accessToken?: string | null
}

export async function sendFcmToken(fcmToken: string, options: SendFcmTokenOptions = {}) {
  const formData = new FormData()
  formData.append(env.FCM_TOKEN_FIELD || 'fcm_token', fcmToken)

  await api.post(env.FCM_TOKEN_ENDPOINT || '/fcm-token', formData, {
    headers: {
      Accept: 'application/json',
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
  })
}
