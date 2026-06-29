export interface InvoicePerson {
  id: string
  name: string
}

export interface InvoiceWorkItem {
  id: string
  name: string
}

export interface InvoiceProject {
  id: string
  name: string
}

export interface InvoiceMaterial {
  id: string
  name: string
  unit?: string | null
}

export interface InvoiceItem {
  id: string
  material: InvoiceMaterial
  quantity: string
  unit: string | null
  unitPrice: string
  totalPrice: string
  notes?: string | null
}

export interface ProjectInvoice {
  id: string
  invoiceNumber: string
  invoiceDate: string | null
  invoiceImage?: string | null
  supplierName: string
  project?: InvoiceProject
  workItem: InvoiceWorkItem | null
  totalAmount: string
  notes?: string | null
  items?: InvoiceItem[]
  createdBy: InvoicePerson | null
  createdAt?: string | null
  deletedAt?: string | null
}

export interface ProjectInvoicesResult {
  project?: InvoiceProject
  totalAmount: number
  invoices: ProjectInvoice[]
}

export interface WorkItemMaterial {
  id: string
  materialId: string
  workItemName: string
  sortOrder: number
  isRequired: boolean
  material: InvoiceMaterial
}

export interface CreateInvoiceItemInput {
  materialId: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface CreateProjectInvoiceInput {
  projectId: string
  workItemId: string
  supplierName: string
  notes?: string
  items: CreateInvoiceItemInput[]
}
