import { api } from '@/lib/axios'
import type {
  CreateProjectInvoiceInput,
  InvoiceItem,
  InvoiceMaterial,
  InvoicePerson,
  InvoiceProject,
  InvoiceWorkItem,
  ProjectInvoice,
  ProjectInvoicesResult,
  WorkItemMaterial,
} from '../models/invoice.model'

interface ApiEnvelope<T> {
  status: number
  message?: string | T
  data?: string | T
}

interface PersonDto {
  id?: number | string
  name?: string
}

interface ProjectDto {
  id?: number | string
  name?: string
}

interface WorkItemDto {
  id?: number | string
  name?: string
}

interface MaterialDto {
  id?: number | string
  name?: string
  unit?: string | null
}

interface InvoiceItemDto {
  id?: number | string
  material_id?: number | string
  material_name?: string | null
  material?: MaterialDto | null
  quantity?: number | string | null
  unit?: string | null
  unit_price?: number | string | null
  total_price?: number | string | null
  notes?: string | null
}

interface InvoiceDto {
  id?: number | string
  invoice_number?: string
  invoice_date?: string | null
  invoice_image?: string | null
  supplier_name?: string | null
  project?: ProjectDto | null
  work_item?: WorkItemDto | null
  total_amount?: number | string | null
  notes?: string | null
  items?: InvoiceItemDto[]
  created_by?: PersonDto | null
  created_at?: string | null
  deleted_at?: string | null
}

interface InvoicesPayloadDto {
  project?: ProjectDto
  total_invoices_amount?: number | string | null
  invoices?: InvoiceDto[]
}

interface CreateInvoiceResponseDto {
  invoice?: InvoiceDto
}

interface WorkItemMaterialDto {
  id?: number | string
  work_item_name?: string | null
  material_id?: number | string
  sort_order?: number | string | null
  is_required?: boolean | number | string
  material?: MaterialDto | null
}

function toStringValue(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function toNumberValue(value: unknown) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function toBooleanValue(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return ['1', 'true', 'yes'].includes(value.trim().toLowerCase())
  return false
}

function mapPerson(dto?: PersonDto | null): InvoicePerson | null {
  if (!dto) return null
  return {
    id: toStringValue(dto.id),
    name: dto.name?.trim() || 'غير محدد',
  }
}

function mapProject(dto?: ProjectDto | null): InvoiceProject | undefined {
  if (!dto) return undefined
  return {
    id: toStringValue(dto.id),
    name: dto.name?.trim() || 'مشروع غير محدد',
  }
}

function mapWorkItem(dto?: WorkItemDto | null): InvoiceWorkItem | null {
  if (!dto) return null
  return {
    id: toStringValue(dto.id),
    name: dto.name?.trim() || 'بند غير محدد',
  }
}

function mapMaterial(dto?: MaterialDto | null): InvoiceMaterial {
  return {
    id: toStringValue(dto?.id),
    name: dto?.name?.trim() || 'مادة غير محددة',
    unit: dto?.unit ?? null,
  }
}

function mapInvoiceItem(dto: InvoiceItemDto): InvoiceItem {
  const material = dto.material ?? {
    id: dto.material_id,
    name: dto.material_name ?? undefined,
    unit: dto.unit,
  }

  return {
    id: toStringValue(dto.id),
    material: mapMaterial(material),
    quantity: toStringValue(dto.quantity, '0'),
    unit: dto.unit ?? material?.unit ?? null,
    unitPrice: toStringValue(dto.unit_price, '0'),
    totalPrice: toStringValue(dto.total_price, '0'),
    notes: dto.notes ?? null,
  }
}

export function mapInvoice(dto: InvoiceDto): ProjectInvoice {
  return {
    id: toStringValue(dto.id),
    invoiceNumber: dto.invoice_number || `فاتورة #${toStringValue(dto.id)}`,
    invoiceDate: dto.invoice_date ?? null,
    invoiceImage: dto.invoice_image ?? null,
    supplierName: dto.supplier_name?.trim() || 'مورد غير محدد',
    project: mapProject(dto.project),
    workItem: mapWorkItem(dto.work_item),
    totalAmount: toStringValue(dto.total_amount, '0'),
    notes: dto.notes ?? null,
    items: Array.isArray(dto.items) ? dto.items.map(mapInvoiceItem) : undefined,
    createdBy: mapPerson(dto.created_by),
    createdAt: dto.created_at ?? null,
    deletedAt: dto.deleted_at ?? null,
  }
}

function unwrapInvoicesPayload(response: ApiEnvelope<InvoicesPayloadDto>): InvoicesPayloadDto {
  if (response.message && typeof response.message === 'object') {
    const payload = response.message as InvoicesPayloadDto | InvoiceDto
    if ('invoices' in payload || 'total_invoices_amount' in payload) return payload as InvoicesPayloadDto
    if ('id' in payload) return { invoices: [payload as InvoiceDto] }
  }

  if (response.data && typeof response.data === 'object') {
    const payload = response.data as InvoicesPayloadDto | InvoiceDto
    if ('invoices' in payload || 'total_invoices_amount' in payload) return payload as InvoicesPayloadDto
    if ('id' in payload) return { invoices: [payload as InvoiceDto] }
  }

  return { invoices: [] }
}

function mapInvoicesResult(payload: InvoicesPayloadDto): ProjectInvoicesResult {
  const invoices = Array.isArray(payload.invoices) ? payload.invoices.map(mapInvoice) : []
  const fallbackTotal = invoices.reduce((sum, invoice) => sum + toNumberValue(invoice.totalAmount), 0)

  return {
    project: mapProject(payload.project),
    totalAmount: toNumberValue(payload.total_invoices_amount ?? fallbackTotal),
    invoices,
  }
}

export async function listProjectInvoices(projectId: string): Promise<ProjectInvoicesResult> {
  const response = await api.get<ApiEnvelope<InvoicesPayloadDto>>(`/projects/${projectId}/invoices`)
  return mapInvoicesResult(unwrapInvoicesPayload(response.data))
}

export async function listArchivedProjectInvoices(projectId: string): Promise<ProjectInvoicesResult> {
  const response = await api.get<ApiEnvelope<InvoicesPayloadDto>>(`/projects/${projectId}/archived-invoices`)
  return mapInvoicesResult(unwrapInvoicesPayload(response.data))
}

export async function getProjectInvoice(projectId: string, invoiceId: string): Promise<ProjectInvoice> {
  const response = await api.get<ApiEnvelope<InvoiceDto>>(`/projects/${projectId}/invoices/${invoiceId}`)
  const payload = response.data.data

  if (payload && typeof payload === 'object') {
    return mapInvoice(payload as InvoiceDto)
  }

  if (response.data.message && typeof response.data.message === 'object') {
    return mapInvoice(response.data.message as InvoiceDto)
  }

  throw new Error('تعذر تحميل تفاصيل الفاتورة.')
}

export async function createProjectInvoice(input: CreateProjectInvoiceInput): Promise<ProjectInvoice> {
  const response = await api.post<ApiEnvelope<CreateInvoiceResponseDto>>('/work-item-invoices', {
    project_id: Number(input.projectId),
    work_item_id: Number(input.workItemId),
    supplier_name: input.supplierName,
    notes: input.notes?.trim() ? input.notes.trim() : undefined,
    items: input.items.map((item) => ({
      material_id: Number(item.materialId),
      quantity: item.quantity,
      unit_price: item.unitPrice,
      notes: item.notes?.trim() ? item.notes.trim() : undefined,
    })),
  })

  const data = response.data.data
  const invoice = data && typeof data === 'object' && 'invoice' in data
    ? (data as CreateInvoiceResponseDto).invoice
    : data

  return mapInvoice((invoice ?? {}) as InvoiceDto)
}

export async function archiveProjectInvoice(invoiceId: string): Promise<void> {
  await api.delete(`/invoices/${invoiceId}`)
}

export async function listWorkItemMaterials(workItemId: string): Promise<WorkItemMaterial[]> {
  const response = await api.get<ApiEnvelope<WorkItemMaterialDto[]>>(`/work-items/${workItemId}/materials`)
  const raw = Array.isArray(response.data.data) ? response.data.data : []

  return raw.map((item) => ({
    id: toStringValue(item.id),
    materialId: toStringValue(item.material_id ?? item.material?.id),
    workItemName: item.work_item_name || 'بند غير محدد',
    sortOrder: toNumberValue(item.sort_order),
    isRequired: toBooleanValue(item.is_required),
    material: mapMaterial(item.material),
  }))
}
