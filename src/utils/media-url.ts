import { env } from '@/config/env'

function getBackendOrigin() {
  return env.API_BASE_URL
    .replace(/\/+$/, '')
    .replace(/\/api(?:\/v\d+)?$/i, '')
}

function normalizeProtocolRelativeUrl(value: string) {
  if (!value.startsWith('//')) return value

  if (typeof window !== 'undefined' && window.location.protocol) {
    return `${window.location.protocol}${value}`
  }

  return `https:${value}`
}

/**
 * يعالج القيم القادمة من الـ API عندما يكون الرابط الخارجي مخزناً بالخطأ
 * داخل بادئة مثل:
 * storage/https://example.com/image.png
 * أو /storage/https://example.com/image.png
 */
export function extractExternalMediaUrl(value?: string | null) {
  if (!value) return ''

  const raw = value.trim()
  if (!raw) return ''

  if (raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw
  }

  if (raw.startsWith('//')) {
    return normalizeProtocolRelativeUrl(raw)
  }

  const match = raw.match(/https?:\/\/.+$/i)
  return match?.[0] ?? ''
}

export function resolveBackendMediaUrl(
  value?: string | null,
  options: { defaultToStorage?: boolean } = {},
) {
  if (!value) return ''

  const raw = value.trim()
  if (!raw) return ''

  const externalUrl = extractExternalMediaUrl(raw)
  if (externalUrl) return externalUrl

  const normalized = raw
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^api(?:\/v\d+)?\//i, '')

  if (!normalized) return ''

  if (/^storage\//i.test(normalized)) {
    return `${getBackendOrigin()}/${normalized}`
  }

  if (options.defaultToStorage) {
    return `${getBackendOrigin()}/storage/${normalized}`
  }

  return `${getBackendOrigin()}/${normalized}`
}
