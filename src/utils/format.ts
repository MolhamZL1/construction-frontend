export function formatArea(value: number) {
  return `${value.toLocaleString('ar-SY')} م²`
}

export function formatCurrency(value: number, currency = 'SYP') {
  return new Intl.NumberFormat('ar-SY', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}
