import { api } from '@/lib/axios'
import type {
  CreateProjectReturnInvoiceInput,
  ProjectReturnInvoice,
  ProjectReturnInvoicesResult,
  ReturnInvoiceItem,
  ReturnInvoicePerson,
  ReturnInvoiceProject,
  ReturnInvoiceWorkItem,
} from '../models/return-invoice.model'

interface ApiEnvelope<T> {
  status?: number
  success?: boolean
  message?: string | T
  data?: T
}

interface PersonDto {
  id?: number | string
  name?: string | null
}

interface ProjectDto {
  id?: number | string
  name?: string | null
}

interface WorkItemDto {
  id?: number | string
  name?: string | null
}

interface ReturnInvoiceItemDto {
  id?: number | string
  return_invoice_id?: number | string
  material_id?: number | string
  material_name_snapshot?: string | null
  material_name?: string | null
  material?: { id?: number | string; name?: string | null } | null
  item_type?: string | null
  quantity?: number | string | null
  unit?: string | null
  unit_price?: number | string | null
  total_price?: number | string | null
  reason?: string | null
  notes?: string | null
}

interface ReturnInvoiceDto {
  id?: number | string
  project_id?: number | string
  work_item_id?: number | string
  invoice_number?: string | null
  invoice_date?: string | null
  supplier_name?: string | null
  return_type?: string | null
  description?: string | null
  notes?: string | null
  attachment_path?: string | null
  created_by?: number | string | PersonDto | null
  created_by_name?: string | null
  created_at?: string | null
  updated_at?: string | null
  project?: ProjectDto | null
  work_item?: WorkItemDto | null
  work_item_name?: string | null
  items?: ReturnInvoiceItemDto[]
  total_amount?: number | string | null
}

interface ReturnInvoicesPayloadDto {
  project?: ProjectDto
  return_invoices?: ReturnInvoiceDto[]
  returns?: ReturnInvoiceDto[]
  invoices?: ReturnInvoiceDto[]
  total_return_amount?: number | string | null
  total_amount?: number | string | null
}

function toStringValue(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function toNumberValue(value: unknown) {
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim()
    const numeric = Number(normalized)
    return Number.isFinite(numeric) ? numeric : 0
  }

  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function mapProject(dto?: ProjectDto | null): ReturnInvoiceProject | undefined {
  if (!dto) return undefined
  return {
    id: toStringValue(dto.id),
    name: dto.name?.trim() || 'مشروع غير محدد',
  }
}

function mapWorkItem(dto: ReturnInvoiceDto): ReturnInvoiceWorkItem | null {
  if (dto.work_item) {
    return {
      id: toStringValue(dto.work_item.id ?? dto.work_item_id),
      name: dto.work_item.name?.trim() || dto.work_item_name?.trim() || 'بند غير محدد',
    }
  }

  if (dto.work_item_id || dto.work_item_name) {
    return {
      id: toStringValue(dto.work_item_id),
      name: dto.work_item_name?.trim() || `بند #${toStringValue(dto.work_item_id)}`,
    }
  }

  return null
}

function mapCreatedBy(dto: ReturnInvoiceDto): { person: ReturnInvoicePerson | null; id: string | null } {
  if (dto.created_by && typeof dto.created_by === 'object') {
    return {
      person: {
        id: toStringValue(dto.created_by.id),
        name: dto.created_by.name?.trim() || 'غير محدد',
      },
      id: toStringValue(dto.created_by.id) || null,
    }
  }

  const id = toStringValue(dto.created_by) || null
  if (dto.created_by_name || id) {
    return {
      person: {
        id: id ?? '',
        name: dto.created_by_name?.trim() || (id ? `مستخدم #${id}` : 'غير محدد'),
      },
      id,
    }
  }

  return { person: null, id: null }
}

function mapItem(dto: ReturnInvoiceItemDto): ReturnInvoiceItem {
  const quantity = toNumberValue(dto.quantity)
  const unitPrice = toNumberValue(dto.unit_price)
  const totalPrice = toNumberValue(dto.total_price) || quantity * unitPrice

  return {
    id: toStringValue(dto.id),
    materialId: toStringValue(dto.material_id ?? dto.material?.id),
    materialName:
      dto.material_name_snapshot?.trim()
      || dto.material_name?.trim()
      || dto.material?.name?.trim()
      || 'مادة غير محددة',
    itemType: dto.item_type ?? null,
    quantity: toStringValue(dto.quantity, '0'),
    unit: dto.unit ?? null,
    unitPrice: toStringValue(dto.unit_price, '0'),
    totalPrice: String(totalPrice),
    reason: dto.reason ?? null,
    notes: dto.notes ?? null,
  }
}

export function mapReturnInvoice(dto: ReturnInvoiceDto): ProjectReturnInvoice {
  const items = Array.isArray(dto.items) ? dto.items.map(mapItem) : []
  const computedTotal = items.reduce((sum, item) => sum + toNumberValue(item.totalPrice), 0)
  const creator = mapCreatedBy(dto)

  return {
    id: toStringValue(dto.id),
    projectId: toStringValue(dto.project_id ?? dto.project?.id),
    workItemId: toStringValue(dto.work_item_id ?? dto.work_item?.id),
    invoiceNumber: dto.invoice_number?.trim() || `مسترجع #${toStringValue(dto.id)}`,
    invoiceDate: dto.invoice_date ?? dto.created_at ?? null,
    supplierName: dto.supplier_name?.trim() || 'مورد غير محدد',
    returnType: dto.return_type ?? null,
    description: dto.description ?? dto.notes ?? null,
    attachmentPath: dto.attachment_path ?? null,
    createdBy: creator.person,
    createdById: creator.id,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
    project: mapProject(dto.project),
    workItem: mapWorkItem(dto),
    items,
    totalAmount: toNumberValue(dto.total_amount) || computedTotal,
  }
}

function extractList(payload: unknown): { rows: ReturnInvoiceDto[]; meta?: ReturnInvoicesPayloadDto } {
  if (Array.isArray(payload)) return { rows: payload as ReturnInvoiceDto[] }
  if (!payload || typeof payload !== 'object') return { rows: [] }

  const object = payload as ReturnInvoicesPayloadDto & { data?: unknown }
  if (Array.isArray(object.return_invoices)) return { rows: object.return_invoices, meta: object }
  if (Array.isArray(object.returns)) return { rows: object.returns, meta: object }
  if (Array.isArray(object.invoices)) return { rows: object.invoices, meta: object }
  if (Array.isArray(object.data)) return { rows: object.data as ReturnInvoiceDto[], meta: object }
  if ('id' in object) return { rows: [object as unknown as ReturnInvoiceDto] }

  return { rows: [], meta: object }
}

function unwrapEnvelope(response: ApiEnvelope<unknown>) {
  const fromData = extractList(response.data)
  if (fromData.rows.length > 0 || response.data !== undefined) return fromData
  return extractList(response.message)
}

export async function listProjectReturnInvoices(projectId: string): Promise<ProjectReturnInvoicesResult> {
  const response = await api.get<ApiEnvelope<unknown>>(`/projects/${projectId}/return-invoices`)
  const extracted = unwrapEnvelope(response.data)
  const returns = extracted.rows.map(mapReturnInvoice)
  const computedTotal = returns.reduce((sum, item) => sum + item.totalAmount, 0)
  const serverTotal = extracted.meta?.total_return_amount ?? extracted.meta?.total_amount

  return {
    project: mapProject(extracted.meta?.project),
    totalAmount: serverTotal === null || serverTotal === undefined ? computedTotal : toNumberValue(serverTotal),
    returns,
  }
}

export async function createProjectReturnInvoice(input: CreateProjectReturnInvoiceInput): Promise<ProjectReturnInvoice | null> {
  const response = await api.post<ApiEnvelope<unknown>>(`/projects/${input.projectId}/return-invoices`, {
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

  const extracted = unwrapEnvelope(response.data)
  return extracted.rows[0] ? mapReturnInvoice(extracted.rows[0]) : null
}
