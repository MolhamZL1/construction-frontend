import type { CreateReturnInvoiceItemInput } from '../models/return-invoice.model'

export interface ReturnInvoiceItemFormRow {
  uid: string
  materialId: string
  quantity: string
  unitPrice: string
  notes: string
}

let rowSequence = 0

export function createEmptyReturnInvoiceRow(): ReturnInvoiceItemFormRow {
  rowSequence += 1
  return {
    uid: `return-row-${Date.now()}-${rowSequence}`,
    materialId: '',
    quantity: '',
    unitPrice: '',
    notes: '',
  }
}

export function normalizeReturnInvoiceItems(rows: ReturnInvoiceItemFormRow[]): CreateReturnInvoiceItemInput[] {
  return rows
    .filter((row) => row.materialId)
    .map((row) => ({
      materialId: row.materialId,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unitPrice),
      notes: row.notes,
    }))
}

export function hasInvalidReturnInvoiceItem(items: CreateReturnInvoiceItemInput[]) {
  return items.some((item) => (
    !item.materialId
    || !Number.isFinite(item.quantity)
    || item.quantity <= 0
    || !Number.isFinite(item.unitPrice)
    || item.unitPrice < 0
  ))
}

export function calculateReturnInvoiceRowsTotal(rows: ReturnInvoiceItemFormRow[]) {
  return rows.reduce((total, row) => {
    const quantity = Number(row.quantity || 0)
    const unitPrice = Number(row.unitPrice || 0)
    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return total
    return total + quantity * unitPrice
  }, 0)
}
