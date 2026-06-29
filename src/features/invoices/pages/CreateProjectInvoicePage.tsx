import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectSummary } from '@/features/projects/hooks/useProjects'
import { getInvoicesErrorMessage, useCreateProjectInvoice, useWorkItemMaterials } from '../hooks/useInvoices'
import type { WorkItemMaterial } from '../models/invoice.model'
import { formatInvoiceMoney } from '../utils/invoice-formatters'
import { InvoiceIcon } from '../components/InvoiceIcon'

interface InvoiceItemFormRow {
  uid: string
  materialId: string
  quantity: string
  unitPrice: string
  notes: string
}

function createEmptyRow(): InvoiceItemFormRow {
  return {
    uid: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    materialId: '',
    quantity: '1',
    unitPrice: '',
    notes: '',
  }
}

export function CreateProjectInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = id ?? ''
  const [workItemId, setWorkItemId] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InvoiceItemFormRow[]>([createEmptyRow()])
  const [formError, setFormError] = useState<string | null>(null)

  const projectQuery = useProjectSummary(projectId)
  const materialsQuery = useWorkItemMaterials(workItemId)
  const createMutation = useCreateProjectInvoice()
  const workItems = projectQuery.data?.workItems ?? []
  const activeWorkItems = workItems.filter((item) => item.isActive)
  const materials = materialsQuery.data ?? []

  useEffect(() => {
    setItems([createEmptyRow()])
  }, [workItemId])

  const total = useMemo(() => items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0)
    const unitPrice = Number(item.unitPrice || 0)
    return sum + (Number.isFinite(quantity) && Number.isFinite(unitPrice) ? quantity * unitPrice : 0)
  }, 0), [items])

  if (!id) {
    return <section className="min-h-screen bg-white p-8 text-right" dir="rtl">رابط المشروع غير صحيح.</section>
  }

  function getMaterial(materialId: string): WorkItemMaterial | undefined {
    return materials.find((item) => String(item.materialId) === String(materialId))
  }

  function updateItem(uid: string, patch: Partial<InvoiceItemFormRow>) {
    setItems((current) => current.map((item) => item.uid === uid ? { ...item, ...patch } : item))
  }

  function removeItem(uid: string) {
    setItems((current) => current.length === 1 ? current : current.filter((item) => item.uid !== uid))
  }

  function addItem() {
    setItems((current) => [...current, createEmptyRow()])
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

    const normalizedItems = items
      .filter((item) => item.materialId)
      .map((item) => ({
        materialId: item.materialId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        notes: item.notes.trim(),
      }))

    if (normalizedItems.length === 0) {
      setFormError('أضف مادة واحدة على الأقل للفاتورة.')
      return
    }

    const invalidItem = normalizedItems.find((item) => !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0)
    if (invalidItem) {
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
          <p className="text-sm font-semibold text-slate-500">اختر بند العمل، ثم أضف مواد الفاتورة من المواد المرتبطة بهذا البند فقط.</p>
        </div>

        {projectQuery.isLoading ? <LoadingState label="جاري تحميل بنود المشروع..." /> : null}
        {projectQuery.isError ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">تعذر تحميل بنود المشروع.</div> : null}

        {!projectQuery.isLoading && !projectQuery.isError ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]"><InvoiceIcon name="file" /></span>
                <div>
                  <h2 className="text-xl font-black text-slate-950">بيانات الفاتورة</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">المعلومات الأساسية المطلوبة حسب API الحالي.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-right">
                  <span className="text-sm font-extrabold text-slate-700">بند العمل *</span>
                  <select
                    value={workItemId}
                    onChange={(event) => setWorkItemId(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                  >
                    <option value="">اختر بند العمل</option>
                    {activeWorkItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>

                <label className="space-y-2 text-right">
                  <span className="text-sm font-extrabold text-slate-700">اسم المورد *</span>
                  <input
                    value={supplierName}
                    onChange={(event) => setSupplierName(event.target.value)}
                    placeholder="مثال: شركة الإسمنت المتحدة"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                  />
                </label>

                <label className="space-y-2 text-right md:col-span-2">
                  <span className="text-sm font-extrabold text-slate-700">ملاحظات</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="ملاحظات اختيارية للفاتورة..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><InvoiceIcon name="box" /></span>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">مواد الفاتورة</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">القائمة تعرض المواد المرتبطة بالبند المحدد فقط.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!workItemId || materialsQuery.isLoading || materials.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <InvoiceIcon name="plus" className="h-4 w-4" />
                  إضافة مادة
                </button>
              </div>

              {!workItemId ? <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">اختر بند العمل ليتم تحميل مواده المرتبطة.</div> : null}
              {workItemId && materialsQuery.isLoading ? <LoadingState label="جاري تحميل مواد البند..." /> : null}
              {workItemId && materialsQuery.isError ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getInvoicesErrorMessage(materialsQuery.error)}</div> : null}
              {workItemId && !materialsQuery.isLoading && !materialsQuery.isError && materials.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">لا توجد مواد مرتبطة بهذا البند، لا يمكن إنشاء فاتورة له قبل ربط المواد.</div>
              ) : null}

              {workItemId && materials.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const selectedMaterial = getMaterial(item.materialId)
                    const rowTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0)

                    return (
                      <div key={item.uid} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => removeItem(item.uid)}
                            disabled={items.length === 1}
                            className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            حذف
                          </button>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">مادة #{index + 1}</span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(260px,2fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(150px,1fr)]">
                          <label className="space-y-2 text-right">
                            <span className="text-sm font-extrabold text-slate-700">المادة *</span>
                            <select
                              value={item.materialId}
                              onChange={(event) => updateItem(item.uid, { materialId: event.target.value })}
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                            >
                              <option value="">اختر المادة</option>
                              {materials.map((linkedMaterial) => (
                                <option key={linkedMaterial.id} value={linkedMaterial.materialId}>
                                  {linkedMaterial.material.name} {linkedMaterial.material.unit ? `- ${linkedMaterial.material.unit}` : ''}
                                </option>
                              ))}
                            </select>
                            <p className="min-h-5 text-xs font-bold text-slate-400">
                              الوحدة: {selectedMaterial?.material.unit ?? '—'}
                            </p>
                          </label>

                          <label className="space-y-2 text-right">
                            <span className="text-sm font-extrabold text-slate-700">الكمية *</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(event) => updateItem(item.uid, { quantity: event.target.value })}
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                            />
                          </label>

                          <label className="space-y-2 text-right">
                            <span className="text-sm font-extrabold text-slate-700">سعر الوحدة *</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(event) => updateItem(item.uid, { unitPrice: event.target.value })}
                              placeholder="0.00"
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                            />
                          </label>

                          <div className="space-y-2 text-right">
                            <span className="block text-sm font-extrabold text-slate-700">السعر الإجمالي</span>
                            <div className="flex h-12 w-full items-center justify-end rounded-2xl border border-emerald-100 bg-emerald-50 px-4 text-sm font-black text-emerald-700">
                              {formatInvoiceMoney(Number.isFinite(rowTotal) ? rowTotal : 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-500">إجمالي الفاتورة</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{formatInvoiceMoney(total)}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/projects/${projectId}/invoices`} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">إلغاء</Link>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !workItemId || materials.length === 0}
                    className="rounded-2xl bg-[#50683f] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#405233] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
                  </button>
                </div>
              </div>

              {formError ? <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{formError}</div> : null}
              {createMutation.isError ? <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getInvoicesErrorMessage(createMutation.error)}</div> : null}
            </div>
          </form>
        ) : null}
      </div>
    </section>
  )
}
