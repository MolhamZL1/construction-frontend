import type { ProjectSpace } from '@/features/projects/models/project.model'

interface SpaceProgressConfig {
  needsSpace: boolean
  filterSpaces?: (space: ProjectSpace) => boolean
}

const defaultSpaceProgressConfig: SpaceProgressConfig = { needsSpace: false }

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

export function getWorkItemSpaceProgressConfig(workItemName: string): SpaceProgressConfig {
  const normalizedName = normalizeName(workItemName)

  if (normalizedName.includes('كهرباء')) return { needsSpace: true }
  if (normalizedName.includes('صحية')) return { needsSpace: true, filterSpaces: (space) => ['kitchen', 'bathroom', 'toilet'].includes(space.type) }
  if (normalizedName.includes('بلاط')) return { needsSpace: true }
  if (normalizedName.includes('جبس')) return { needsSpace: true, filterSpaces: (space) => space.ceilingFinishType === 'gypsum' }
  if (normalizedName.includes('دهان')) return { needsSpace: true, filterSpaces: (space) => space.wallFinishType === 'paint' || space.ceilingFinishType === 'paint' }
  if (normalizedName.includes('طينة') || normalizedName.includes('لياسة')) return { needsSpace: true }
  if (normalizedName.includes('سيراميك')) return { needsSpace: true, filterSpaces: (space) => space.wallFinishType === 'ceramic' || space.ceilingFinishType === 'ceramic' }

  return defaultSpaceProgressConfig
}

export function filterWorkItemProgressSpaces<T extends ProjectSpace>(spaces: T[], config: SpaceProgressConfig): T[] {
  return config.filterSpaces ? spaces.filter(config.filterSpaces) : spaces
}
