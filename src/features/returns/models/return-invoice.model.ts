export interface ReturnInvoicePerson {
  id: string
  name: string
}

export interface ReturnInvoiceProject {
  id: string
  name: string
}

export interface ReturnInvoiceWorkItem {
  id: string
  name: string
}

export interface ReturnInvoiceItem {
  id: string
  materialId: string
  materialName: string
  itemType?: string | null
  quantity: string
  unit?: string | null
  unitPrice: string
  totalPrice: string
  reason?: string | null
  notes?: string | null
}

export interface ProjectReturnInvoice {
  id: string
  projectId: string
  workItemId: string
  invoiceNumber: string
  invoiceDate: string | null
  supplierName: string
  returnType?: string | null
  description?: string | null
  attachmentPath?: string | null
  createdBy: ReturnInvoicePerson | null
  createdById: string | null
  createdAt?: string | null
  updatedAt?: string | null
  project?: ReturnInvoiceProject
  workItem: ReturnInvoiceWorkItem | null
  items: ReturnInvoiceItem[]
  totalAmount: number
}

export interface ProjectReturnInvoicesResult {
  project?: ReturnInvoiceProject
  totalAmount: number
  returns: ProjectReturnInvoice[]
}

export interface CreateReturnInvoiceItemInput {
  materialId: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface CreateProjectReturnInvoiceInput {
  projectId: string
  workItemId: string
  supplierName: string
  notes?: string
  items: CreateReturnInvoiceItemInput[]
}
