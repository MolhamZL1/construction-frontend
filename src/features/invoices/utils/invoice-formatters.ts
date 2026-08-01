import { formatUsdCurrency } from '@/utils/currency'
export function toInvoiceNumber(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

export function formatInvoiceMoney(value: string | number | null | undefined) {
  return formatUsdCurrency(value ?? 0)
}

export function formatInvoicePlainNumber(value: string | number | null | undefined) {
  const safeValue = toInvoiceNumber(value)

  return safeValue.toLocaleString('ar-SY', {
    minimumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

export function formatInvoiceDate(value?: string | null) {
  if (!value) return 'غير محدد'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function getInvoiceInitials(name?: string | null) {
  const text = name?.trim()
  if (!text) return '؟'

  return text
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}


export function formatInvoiceQuantity(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0)
  const safeValue = Number.isFinite(numeric) ? numeric : 0

  return safeValue.toLocaleString('ar-SY', {
    minimumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}
