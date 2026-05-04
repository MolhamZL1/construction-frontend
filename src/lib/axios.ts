import axios from 'axios'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/config/constants'
import { env } from '@/config/env'

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
