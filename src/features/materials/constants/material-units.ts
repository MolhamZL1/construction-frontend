export interface MaterialUnitOption {
  value: string
  label: string
}

export const DEFAULT_MATERIAL_UNIT_OPTIONS: MaterialUnitOption[] = [
  { value: 'Bag', label: 'كيس' },
  { value: 'Barrel', label: 'برميل' },
  { value: 'Board', label: 'لوح' },
  { value: 'Box', label: 'صندوق' },
  { value: 'Bucket', label: 'دلو' },
  { value: 'Cubic Meter', label: 'متر مكعب' },
  { value: 'm²', label: 'متر مربع' },
  { value: 'Meter', label: 'متر' },
  { value: 'Piece', label: 'قطعة' },
  { value: 'Sheet', label: 'ورقة' },
]

export function getMaterialUnitLabel(unit?: string | null) {
  if (!unit) return '—'

  return DEFAULT_MATERIAL_UNIT_OPTIONS.find((option) => option.value === unit)?.label ?? unit
}

export function mergeMaterialUnitOptions(extraUnits: Array<string | null | undefined> = []) {
  const options = [...DEFAULT_MATERIAL_UNIT_OPTIONS]
  const existingValues = new Set(options.map((option) => option.value))

  extraUnits
    .map((unit) => unit?.trim())
    .filter((unit): unit is string => Boolean(unit))
    .forEach((unit) => {
      if (!existingValues.has(unit)) {
        options.push({ value: unit, label: getMaterialUnitLabel(unit) })
        existingValues.add(unit)
      }
    })

  return options
}
