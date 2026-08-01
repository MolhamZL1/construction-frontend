export type CurrencyValue = number | string | null | undefined

interface UsdCurrencyFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  emptyValue?: string
}

function toFiniteCurrencyNumber(value: CurrencyValue) {
  if (value === null || value === undefined || value === '') return null

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

export function formatUsdCurrency(
  value: CurrencyValue,
  options: UsdCurrencyFormatOptions = {},
) {
  const numericValue = toFiniteCurrencyNumber(value)
  if (numericValue === null) return options.emptyValue ?? '—'

  const maximumFractionDigits = options.maximumFractionDigits ?? 2
  const minimumFractionDigits =
    options.minimumFractionDigits ?? (Number.isInteger(numericValue) ? 0 : Math.min(2, maximumFractionDigits))

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericValue)
}

export function formatUsdCompactCurrency(value: CurrencyValue) {
  const numericValue = toFiniteCurrencyNumber(value) ?? 0

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numericValue)
}
