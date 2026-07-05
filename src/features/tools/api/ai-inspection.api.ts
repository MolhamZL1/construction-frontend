import { api } from '@/lib/axios'

export type AiInspectionType = 'tiles' | 'paint' | 'cement_plaster' | 'ceiling' | 'electrical' | 'plumbing' | 'general'

export interface AiInspectionReport {
  status?: string
  score?: number
  confidence?: number
  summary?: string
  confirmed_defects?: string[]
  visual_observations?: string[]
  unverified_items?: string[]
  recommendations?: string[]
}

export interface AiInspectionResult {
  success?: boolean
  message?: string
  inspection_type?: AiInspectionType | string
  report?: AiInspectionReport
}

export interface InspectConstructionImagePayload {
  image: File
  inspectionType: AiInspectionType
}

export interface InspectProgressRequestPayload {
  progressRequestId: string | number
  inspectionType: AiInspectionType
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined

  const values = value.map((item) => String(item ?? '').trim()).filter(Boolean)
  return values.length > 0 ? values : undefined
}

function normalizeNumber(value: unknown): number | undefined {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function normalizeReport(value: unknown): AiInspectionReport | undefined {
  if (!isRecord(value)) return undefined

  return {
    status: typeof value.status === 'string' ? value.status : undefined,
    score: normalizeNumber(value.score),
    confidence: normalizeNumber(value.confidence),
    summary: typeof value.summary === 'string' ? value.summary : undefined,
    confirmed_defects: normalizeStringArray(value.confirmed_defects ?? value.defects ?? value.issues),
    visual_observations: normalizeStringArray(value.visual_observations ?? value.observations),
    unverified_items: normalizeStringArray(value.unverified_items),
    recommendations: normalizeStringArray(value.recommendations),
  }
}

function normalizeInspectionResult(payload: unknown): AiInspectionResult {
  if (!isRecord(payload)) return {}

  const nestedData = payload.data
  if (isRecord(nestedData)) {
    const nestedResult = normalizeInspectionResult(nestedData)

    return {
      success: typeof payload.success === 'boolean' ? payload.success : nestedResult.success,
      message: typeof payload.message === 'string' ? payload.message : nestedResult.message,
      inspection_type: nestedResult.inspection_type,
      report: nestedResult.report,
    }
  }

  return {
    success: typeof payload.success === 'boolean' ? payload.success : undefined,
    message: typeof payload.message === 'string' ? payload.message : undefined,
    inspection_type: typeof payload.inspection_type === 'string' ? payload.inspection_type : undefined,
    report: normalizeReport(payload.report ?? payload.result),
  }
}

export async function inspectConstructionImage({ image, inspectionType }: InspectConstructionImagePayload) {
  const formData = new FormData()
  formData.append('construction_image', image)
  formData.append('inspection_type', inspectionType)

  const response = await api.post<unknown>('/ai-inspect-job', formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })

  return normalizeInspectionResult(response.data)
}

export async function inspectProgressRequest({ progressRequestId, inspectionType }: InspectProgressRequestPayload) {
  const formData = new FormData()
  formData.append('progress_update_request_id', String(progressRequestId))
  formData.append('inspection_type', inspectionType)

  const response = await api.post<unknown>('/ai-inspect-job2', formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })

  return normalizeInspectionResult(response.data)
}
