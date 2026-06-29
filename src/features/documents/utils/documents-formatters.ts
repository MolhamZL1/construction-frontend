import type { ProjectDocumentListItem } from '../models/document.model'

export function formatDocumentDate(value?: string | null) {
  if (!value) {
    return 'غير محدد'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'غير محدد'
  }

  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function getFileExtensionFromUrl(value?: string | null) {
  if (!value) {
    return 'ملف'
  }

  const cleanValue = value.split('?')[0]
  const extension = cleanValue.split('.').pop()?.trim()

  if (!extension || extension.length > 6 || extension.includes('/')) {
    return 'ملف'
  }

  return extension.toUpperCase()
}

export function getLatestVersionLabel(document: ProjectDocumentListItem) {
  const versionNo = document.latestVersion?.versionNo ?? document.versionsCount

  return versionNo > 0 ? `v${versionNo}` : '—'
}

export function documentMatchesSearch(document: ProjectDocumentListItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return [document.title, document.category, getLatestVersionLabel(document)]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedSearch))
}
