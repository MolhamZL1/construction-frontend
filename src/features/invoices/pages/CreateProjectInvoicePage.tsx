import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { InvoiceIcon } from '../components/InvoiceIcon'
import { InvoiceDetailsCard, InvoiceMaterialsCard, InvoiceSubmitCard } from '../components/create-invoice'
import { getInvoicesErrorMessage, useCreateProjectInvoice, useWorkItemMaterials } from '../hooks/useInvoices'
import type { WorkItemMaterial } from '../models/invoice.model'
import {
  calculateInvoiceRowsTotal,
  createEmptyInvoiceRow,
  hasInvalidInvoiceItem,
  normalizeInvoiceItems,
  type InvoiceItemFormRow,
} from '../utils/invoice-form'

export function CreateProjectInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = id ?? ''
  const [workItemId, setWorkItemId] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InvoiceItemFormRow[]>([createEmptyInvoiceRow()])
  const [formError, setFormError] = useState<string | null>(null)

  const projectQuery = useProjectSummary(projectId)
  const createMutation = useCreateProjectInvoice()
  const workItems = projectQuery.data?.workItems ?? []
  const activeWorkItems = useMemo(() => workItems.filter((item) => item.isActive), [workItems])
  const selectedWorkItem = useMemo(
    () => activeWorkItems.find((item) => String(item.id) === String(workItemId)),
    [activeWorkItems, workItemId]
  )
  const selectedWorkItemName = selectedWorkItem?.name?.trim() ?? ''
  const materialsQuery = useWorkItemMaterials(selectedWorkItemName)
  const materials: WorkItemMaterial[] = materialsQuery.data ?? []
  const total = useMemo(() => calculateInvoiceRowsTotal(items), [items])

  useEffect(() => {
    setItems([createEmptyInvoiceRow()])
  }, [workItemId])

  if (!id) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  function updateItem(uid: string, patch: Partial<InvoiceItemFormRow>) {
    setItems((current) => current.map((item) => item.uid === uid ? { ...item, ...patch } : item))
  }

  function removeItem(uid: string) {
    setItems((current) => current.length === 1 ? current : current.filter((item) => item.uid !== uid))
  }

  function addItem() {
    setItems((current) => [...current, createEmptyInvoiceRow()])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!workItemId) {
      setFormError('اختر بند العمل أولاً.')
      return
    }

    if (!supplierName.trim()) {
      setFormError('اسم المورد مطلوب.')
      return
    }

    const normalizedItems = normalizeInvoiceItems(items)

    if (normalizedItems.length === 0) {
      setFormError('أضف مادة واحدة على الأقل للفاتورة.')
      return
    }

    if (hasInvalidInvoiceItem(normalizedItems)) {
      setFormError('تأكد من أن الكميات أكبر من صفر وأن أسعار الوحدة صالحة.')
      return
    }

    try {
      await createMutation.mutateAsync({
        projectId,
        workItemId,
        supplierName: supplierName.trim(),
        notes,
        items: normalizedItems,
      })
      navigate(`/projects/${projectId}/invoices`)
    } catch {
      return
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 text-right">
          <Link to={`/projects/${projectId}/invoices`} className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
            <InvoiceIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
            العودة إلى الفواتير
          </Link>
          <h1 className="text-3xl font-black text-slate-950">إنشاء فاتورة جديدة</h1>
          <p className="text-sm font-semibold text-slate-500">اختر بند العمل، ثم أضف المواد المرتبطة باسم هذا البند.</p>
        </div>

        {projectQuery.isLoading ? <LoadingState label="جاري تحميل بنود المشروع..." /> : null}
        {projectQuery.isError ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">تعذر تحميل بنود المشروع.</div> : null}

        {!projectQuery.isLoading && !projectQuery.isError ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <InvoiceDetailsCard
              workItems={activeWorkItems}
              workItemId={workItemId}
              supplierName={supplierName}
              notes={notes}
              onWorkItemChange={setWorkItemId}
              onSupplierNameChange={setSupplierName}
              onNotesChange={setNotes}
            />

            <InvoiceMaterialsCard
              rows={items}
              materials={materials}
              isWorkItemSelected={Boolean(selectedWorkItemName)}
              isLoading={materialsQuery.isLoading}
              isError={materialsQuery.isError}
              errorMessage={materialsQuery.isError ? getInvoicesErrorMessage(materialsQuery.error) : undefined}
              onAddRow={addItem}
              onRemoveRow={removeItem}
              onUpdateRow={updateItem}
            />

            <InvoiceSubmitCard
              projectId={projectId}
              total={total}
              isSubmitting={createMutation.isPending}
              isSubmitDisabled={createMutation.isPending || !workItemId || materials.length === 0}
              formError={formError}
              submitError={createMutation.isError ? getInvoicesErrorMessage(createMutation.error) : null}
            />
          </form>
        ) : null}
      </div>
    </section>
  )
}
