const DETAIL_META_KEYS = new Set([
  'id',
  'key',
  'field',
  'name',
  'value',
  'unit',
  'created_at',
  'updated_at',
  'deleted_at',
])

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function normalizeDetailKey(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

function createDetailLookup(keys: readonly string[]) {
  return new Set(keys.map(normalizeDetailKey).filter(Boolean))
}

function isReadableDetailValue(value: unknown) {
  return ['string', 'number', 'boolean'].includes(typeof value) || value === null
}

export function getWorkItemDetailValue(details: readonly unknown[] | null | undefined, keys: readonly string[]): unknown {
  const lookup = createDetailLookup(keys)

  if (!details?.length || lookup.size === 0) return undefined

  for (const detail of details) {
    const record = asRecord(detail)
    if (!record) continue

    const directKey = normalizeDetailKey(record.key ?? record.field ?? record.name)
    if (directKey && lookup.has(directKey)) return record.value

    for (const [key, value] of Object.entries(record)) {
      if (DETAIL_META_KEYS.has(key)) continue
      if (!lookup.has(normalizeDetailKey(key))) continue
      if (isReadableDetailValue(value)) return value
    }
  }

  return undefined
}

export function getWorkItemDetailNumber(details: readonly unknown[] | null | undefined, keys: readonly string[], fallback = 0) {
  const value = getWorkItemDetailValue(details, keys)
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

export function getWorkItemDetailText(details: readonly unknown[] | null | undefined, keys: readonly string[], fallback = '') {
  const value = getWorkItemDetailValue(details, keys)

  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}
