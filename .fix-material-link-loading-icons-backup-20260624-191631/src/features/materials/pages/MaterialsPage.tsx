import { useMemo, useState } from 'react'
import { LoadingState } from '@/components/ui'
import { DeleteMaterialDialog } from '../components/DeleteMaterialDialog'
import { MaterialsEmptyState } from '../components/MaterialsEmptyState'
import { MaterialsPageHeader } from '../components/MaterialsPageHeader'
import { MaterialsTable } from '../components/MaterialsTable'
import { MaterialsToolbar } from '../components/MaterialsToolbar'
import { MaterialWorkItemsDialog } from '../components/MaterialWorkItemsDialog'
import {
  getMaterialsErrorMessage,
  useAttachMaterialToWorkItem,
  useDebouncedValue,
  useDeleteMaterial,
  useDetachMaterialFromWorkItem,
  useMaterials,
  useSystemWorkItems,
  useWorkItemMaterialLinksSummary,
} from '../hooks/useMaterials'
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

function uniqueNames(names: string[]) {
  return names.filter((name, index) => Boolean(name) && names.indexOf(name) === index)
}

export function MaterialsPage() {
  const [search, setSearch] = useState('')
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const [materialToManageLinks, setMaterialToManageLinks] = useState<Material | null>(null)
  const debouncedSearch = useDebouncedValue(search, 250)
  const materialsQuery = useMaterials()
  const systemWorkItemsQuery = useSystemWorkItems()
  const linksSummaryQuery = useWorkItemMaterialLinksSummary()
  const deleteMutation = useDeleteMaterial()
  const attachMutation = useAttachMaterialToWorkItem()
  const detachMutation = useDetachMaterialFromWorkItem()
  const materials = materialsQuery.data ?? []
  const linksSummary = linksSummaryQuery.data ?? {}

  const displayMaterials = useMemo(
    () => materials.map((material) => ({
      ...material,
      workItemNames: uniqueNames([...(material.workItemNames ?? []), ...(linksSummary[material.id] ?? [])]),
    })),
    [linksSummary, materials]
  )

  const filteredMaterials = useMemo(
    () => displayMaterials.filter((material) => materialMatchesSearch(material, debouncedSearch)),
    [debouncedSearch, displayMaterials]
  )

  const managedMaterial = materialToManageLinks
    ? displayMaterials.find((material) => material.id === materialToManageLinks.id) ?? materialToManageLinks
    : null

  function confirmDelete() {
    if (!materialToDelete) return

    deleteMutation.mutate(materialToDelete.id, {
      onSuccess: () => setMaterialToDelete(null),
    })
  }

  function attachToWorkItem(workItemName: string) {
    if (!managedMaterial) return

    attachMutation.mutate({ materialId: managedMaterial.id, workItemName })
  }

  function detachFromWorkItem(workItemName: string) {
    if (!managedMaterial) return

    detachMutation.mutate({ materialId: managedMaterial.id, workItemName })
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <MaterialsPageHeader />

        <MaterialsToolbar
          search={search}
          totalCount={displayMaterials.length}
          filteredCount={filteredMaterials.length}
          onSearchChange={setSearch}
        />

        {materialsQuery.error ? <InlineError message={getMaterialsErrorMessage(materialsQuery.error)} /> : null}
        {linksSummaryQuery.error ? <InlineError message={getMaterialsErrorMessage(linksSummaryQuery.error)} /> : null}

        {materialsQuery.isLoading ? <LoadingState label="جاري تحميل المواد..." /> : null}

        {!materialsQuery.isLoading && !materialsQuery.error && filteredMaterials.length === 0 ? (
          <MaterialsEmptyState isFiltering={Boolean(search.trim())} />
        ) : null}

        {!materialsQuery.isLoading && filteredMaterials.length > 0 ? (
          <MaterialsTable materials={filteredMaterials} onDelete={setMaterialToDelete} onManageWorkItems={setMaterialToManageLinks} />
        ) : null}
      </div>

      <DeleteMaterialDialog
        material={materialToDelete}
        isDeleting={deleteMutation.isPending}
        errorMessage={deleteMutation.error ? getMaterialsErrorMessage(deleteMutation.error) : null}
        onClose={() => (deleteMutation.isPending ? undefined : setMaterialToDelete(null))}
        onConfirm={confirmDelete}
      />

      <MaterialWorkItemsDialog
        material={managedMaterial}
        workItems={systemWorkItemsQuery.data ?? []}
        linkedNames={managedMaterial?.workItemNames ?? []}
        isLoadingWorkItems={systemWorkItemsQuery.isLoading}
        isLoadingLinks={linksSummaryQuery.isFetching}
        isAttaching={attachMutation.isPending}
        isDetaching={detachMutation.isPending}
        attachErrorMessage={attachMutation.error ? getMaterialsErrorMessage(attachMutation.error) : null}
        detachErrorMessage={detachMutation.error ? getMaterialsErrorMessage(detachMutation.error) : null}
        onClose={() => setMaterialToManageLinks(null)}
        onAttach={attachToWorkItem}
        onDetach={detachFromWorkItem}
      />
    </section>
  )
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div>
}
