import { useMemo, useState } from 'react'
import { LoadingState } from '@/components/ui'
import { DeleteMaterialDialog } from '../components/DeleteMaterialDialog'
import { MaterialsEmptyState } from '../components/MaterialsEmptyState'
import { MaterialsPageHeader } from '../components/MaterialsPageHeader'
import { MaterialsTable } from '../components/MaterialsTable'
import { MaterialsToolbar } from '../components/MaterialsToolbar'
import { getMaterialsErrorMessage, useDebouncedValue, useDeleteMaterial, useMaterials } from '../hooks/useMaterials'
import type { Material } from '../models/material.model'

function materialMatchesSearch(material: Material, search: string) {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) return true

  return [material.name, material.unit, material.id, ...material.workItemNames]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch)
}

export function MaterialsPage() {
  const [search, setSearch] = useState('')
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const debouncedSearch = useDebouncedValue(search, 250)
  const materialsQuery = useMaterials()
  const deleteMutation = useDeleteMaterial()
  const materials = materialsQuery.data ?? []

  const filteredMaterials = useMemo(
    () => materials.filter((material) => materialMatchesSearch(material, debouncedSearch)),
    [debouncedSearch, materials]
  )


  function confirmDelete() {
    if (!materialToDelete) return

    deleteMutation.mutate(materialToDelete.id, {
      onSuccess: () => setMaterialToDelete(null),
    })
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <MaterialsPageHeader />
      
        <MaterialsToolbar
          search={search}
          totalCount={materials.length}
          filteredCount={filteredMaterials.length}
          onSearchChange={setSearch}
        />

        {materialsQuery.error ? <InlineError message={getMaterialsErrorMessage(materialsQuery.error)} /> : null}

        {materialsQuery.isLoading ? <LoadingState label="جاري تحميل المواد..." /> : null}

        {!materialsQuery.isLoading && !materialsQuery.error && filteredMaterials.length === 0 ? (
          <MaterialsEmptyState isFiltering={Boolean(search.trim())} />
        ) : null}

        {!materialsQuery.isLoading && filteredMaterials.length > 0 ? (
          <MaterialsTable materials={filteredMaterials} onDelete={setMaterialToDelete} />
        ) : null}
      </div>

      <DeleteMaterialDialog
        material={materialToDelete}
        isDeleting={deleteMutation.isPending}
        errorMessage={deleteMutation.error ? getMaterialsErrorMessage(deleteMutation.error) : null}
        onClose={() => (deleteMutation.isPending ? undefined : setMaterialToDelete(null))}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div>
}
