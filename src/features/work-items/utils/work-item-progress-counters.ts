import type { WorkItem } from '../models/work-item.model'
import { getWorkItemDetailNumber } from '@/utils/work-item-details'

export interface WorkItemProgressCounter {
  id: string
  fieldName: string
  totalFieldName?: string
  label: string
  total: number
  completed: number
  remaining: number
}

interface CounterConfig {
  id: string
  fieldName: string
  totalFieldName?: string
  label: string
  totalKeys: string[]
  completedKeys: string[]
}

const MELLABEN_COUNTERS: CounterConfig[] = [
  {
    id: 'wood_doors',
    fieldName: 'completed_wood_doors',
    label: 'أبواب الخشب',
    totalKeys: ['total_wood_doors', 'wood_doors_count', 'woodDoorsCount'],
    completedKeys: ['completed_wood_doors', 'completedWoodDoors'],
  },
  {
    id: 'aluminum_doors',
    fieldName: 'completed_aluminum_doors',
    label: 'أبواب الألمنيوم',
    totalKeys: ['total_aluminum_doors', 'aluminum_doors_count', 'aluminumDoorsCount'],
    completedKeys: ['completed_aluminum_doors', 'completedAluminumDoors'],
  },
  {
    id: 'windows',
    fieldName: 'completed_windows',
    label: 'النوافذ',
    totalKeys: ['total_windows', 'windows_count', 'windowsCount'],
    completedKeys: ['completed_windows', 'completedWindows'],
  },
]

const DOORS_COUNTERS: CounterConfig[] = [
  {
    id: 'doors',
    fieldName: 'completed_doors',
    totalFieldName: 'total_doors',
    label: 'الأبواب',
    totalKeys: ['total_doors', 'doors_count', 'doorsCount', 'total_wood_doors'],
    completedKeys: ['completed_doors', 'completedDoors', 'completed_wood_doors'],
  },
]

const ALUMINUM_COUNTERS: CounterConfig[] = [
  {
    id: 'aluminum',
    fieldName: 'completed_aluminum',
    totalFieldName: 'total_aluminum',
    label: 'قطع الألمنيوم',
    totalKeys: ['total_aluminum', 'total_aluminum_pieces', 'aluminum_count', 'aluminumCount', 'total_aluminum_doors', 'total_windows'],
    completedKeys: ['completed_aluminum', 'completedAluminum', 'completed_aluminum_doors', 'completed_windows'],
  },
]

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

function getCounterConfigs(workItemName: string): CounterConfig[] {
  const normalizedName = normalizeName(workItemName)

  if (normalizedName.includes('ملابن')) return MELLABEN_COUNTERS
  if (normalizedName.includes('أبواب ونجارة') || normalizedName.includes('نجارة')) return DOORS_COUNTERS
  if (normalizedName.includes('ألمنيوم') || normalizedName.includes('المنيوم') || normalizedName.includes('أبجورات')) return ALUMINUM_COUNTERS

  return []
}

export function getWorkItemProgressCounters(item: WorkItem): WorkItemProgressCounter[] {
  return getCounterConfigs(item.name).map((counter) => {
    const total = getWorkItemDetailNumber(item.details, counter.totalKeys, 0)
    const completed = getWorkItemDetailNumber(item.details, counter.completedKeys, 0)
    const remaining = Math.max(total - completed, 0)

    return {
      id: counter.id,
      fieldName: counter.fieldName,
      totalFieldName: counter.totalFieldName,
      label: counter.label,
      total,
      completed,
      remaining,
    }
  })
}

export function getRemainingCountForProgressField(item: WorkItem, fieldName: string): number | undefined {
  return getWorkItemProgressCounters(item).find((counter) => counter.fieldName === fieldName)?.remaining
}

export function getInitialProgressFieldValue(item: WorkItem, fieldName: string): string | undefined {
  for (const counter of getCounterConfigs(item.name)) {
    if (counter.totalFieldName === fieldName) {
      return String(getWorkItemDetailNumber(item.details, counter.totalKeys, 0))
    }

    if (counter.fieldName === fieldName) return '0'
  }

  return undefined
}
