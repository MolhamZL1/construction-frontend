import { formatUsdCurrency } from '@/utils/currency'
export function getTodayDateInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getDateInputValueFromApiDate(value?: string | null) {
  if (!value) return ''

  const directDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (directDate) return directDate

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return ''

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatCurrency(value?: number | string | null) {
  return formatUsdCurrency(value ?? 0)
}

export function formatExpenseDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
