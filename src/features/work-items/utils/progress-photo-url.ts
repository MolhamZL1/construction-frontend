import { env } from '@/config/env'

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function getBackendOrigin() {
  return env.API_BASE_URL
    .replace(/\/+$/, '')
    .replace(/\/api(?:\/v\d+)?$/i, '')
}

function normalizePath(value: string) {
  return value.trim().replace(/^\/+/, '')
}

function isBrowserUrl(value: string) {
  return /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')
}

function getUrlPath(value: string) {
  try {
    const parsed = new URL(value)
    return `${parsed.pathname}${parsed.search}`.replace(/^\/+/, '')
  } catch {
    return ''
  }
}

function withoutApiPrefix(path: string) {
  return path.replace(/^api(?:\/v\d+)?\//i, '')
}

function stripStoragePrefix(path: string) {
  return withoutApiPrefix(path).replace(/^storage\//i, '')
}

function toStorageUrl(path: string) {
  const normalized = withoutApiPrefix(normalizePath(path))
  if (!normalized) return ''
  if (normalized.startsWith('storage/')) return `${getBackendOrigin()}/${normalized}`
  return `${getBackendOrigin()}/storage/${normalized}`
}

function toDirectUrl(path: string) {
  const normalized = withoutApiPrefix(normalizePath(path))
  if (!normalized) return ''
  return `${getBackendOrigin()}/${normalized}`
}

export function getProgressPhotoUrlCandidates(value?: string | null) {
  if (!value) return []

  const raw = value.trim()
  if (!raw) return []

  if (raw.startsWith('data:') || raw.startsWith('blob:')) return [raw]

  const candidates: string[] = []

  if (isBrowserUrl(raw)) {
    candidates.push(raw)

    const urlPath = getUrlPath(raw)
    if (urlPath) {
      candidates.push(toDirectUrl(urlPath))
      candidates.push(toStorageUrl(stripStoragePrefix(urlPath)))

      const storageIndex = urlPath.toLowerCase().indexOf('storage/')
      if (storageIndex >= 0) {
        const afterStorage = urlPath.slice(storageIndex + 'storage/'.length)
        candidates.push(toStorageUrl(afterStorage))
      }
    }

    return unique(candidates)
  }

  const normalized = normalizePath(raw)
  candidates.push(toStorageUrl(normalized))
  candidates.push(toDirectUrl(normalized))

  if (normalized.toLowerCase().includes('/storage/')) {
    const afterStorage = normalized.slice(normalized.toLowerCase().indexOf('/storage/') + '/storage/'.length)
    candidates.push(toStorageUrl(afterStorage))
  }

  return unique(candidates)
}

export function getProgressPhotoUrl(filePath?: string | null) {
  return getProgressPhotoUrlCandidates(filePath)[0] ?? ''
}

export function getProgressPhotoDirectUrl(filePath?: string | null) {
  return getProgressPhotoUrl(filePath)
}
