export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'نظام إدارة مشاريع الإكساء',

  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyA-rrlXlPN9K9AtK_29Owf3EQYnuv2XNwg',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'graduation-9d9e5.firebaseapp.com',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'graduation-9d9e5',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'graduation-9d9e5.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '650351174300',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:650351174300:web:0571fc70358aa39d328359',
  FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-HLD9C2KEVM',
  FIREBASE_VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '',

  FCM_TOKEN_ENDPOINT: import.meta.env.VITE_FCM_TOKEN_ENDPOINT ?? '/fcm-token',
  FCM_TOKEN_FIELD: import.meta.env.VITE_FCM_TOKEN_FIELD ?? 'fcm_token',
} as const
