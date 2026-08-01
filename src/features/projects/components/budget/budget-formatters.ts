import { formatUsdCurrency } from '@/utils/currency'
export function formatBudgetNumber(value: number | string | null | undefined, maximumFractionDigits = 2) {
  if (value === null || value === undefined || value === '') return '—'

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return '—'

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(numericValue)
}

export function formatBudgetMoney(value: number | string | null | undefined) {
  return formatUsdCurrency(value)
}

export function parseManualPrice(value: string | undefined) {
  if (!value?.trim()) return null

  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null
}
