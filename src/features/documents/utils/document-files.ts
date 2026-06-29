export const LARGE_DOCUMENT_WARNING_SIZE_MB = 10
export const LARGE_DOCUMENT_WARNING_SIZE_BYTES = LARGE_DOCUMENT_WARNING_SIZE_MB * 1024 * 1024

export function formatFileSize(size: number) {
  if (!size) {
    return '0 KB'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const power = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** power

  return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}

export function isLargeDocumentFile(file: File | null | undefined) {
  return Boolean(file && file.size >= LARGE_DOCUMENT_WARNING_SIZE_BYTES)
}
