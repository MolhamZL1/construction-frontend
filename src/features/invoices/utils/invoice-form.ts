import type { CreateInvoiceItemInput } from '../models/invoice.model'

export interface InvoiceItemFormRow {
  uid: string
  materialId: string
  quantity: string
  unitPrice: string
  notes: string
}

export function createEmptyInvoiceRow(): InvoiceItemFormRow {
  const uid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

  return {
    uid,
    materialId: '',
    quantity: '1',
    unitPrice: '',
    notes: '',
  }
}

export function calculateInvoiceRowsTotal(items: InvoiceItemFormRow[]) {
  return items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0)
    const unitPrice = Number(item.unitPrice || 0)
    return sum + (Number.isFinite(quantity) && Number.isFinite(unitPrice) ? quantity * unitPrice : 0)
  }, 0)
}

export function normalizeInvoiceItems(items: InvoiceItemFormRow[]): CreateInvoiceItemInput[] {
  return items
    .filter((item) => item.materialId)
    .map((item) => ({
      materialId: item.materialId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      notes: item.notes.trim(),
    }))
}

export function hasInvalidInvoiceItem(items: CreateInvoiceItemInput[]) {
  return items.some((item) => (
    !Number.isFinite(item.quantity)
    || item.quantity <= 0
    || !Number.isFinite(item.unitPrice)
    || item.unitPrice < 0
  ))
}
