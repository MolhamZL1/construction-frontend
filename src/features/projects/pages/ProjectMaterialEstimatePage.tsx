import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { LoadingState } from '@/components/ui'

import {
  BudgetIcon,
  BudgetUnavailableState,
  CostComparisonChart,
  CostComparisonChartSkeleton,
  MaterialEstimateTable,
  WorkshopEstimateTable,
  formatBudgetMoney,
  parseManualPrice,
  type ResolvedMaterialEstimateItem,
} from '../components/budget'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import {
  useProjectCostComparison,
  useProjectMaterialEstimate,
  useProjectTotalCostEstimate,
  useProjectWorkshopEstimate,
} from '../hooks/useProjectBudget'
import { getProjectsErrorMessage } from '../hooks/useProjects'

function getUnavailableDescription(type: 'materials' | 'workshops') {
  if (type === 'materials') {
    return 'لا توجد مشاريع سابقة تحتوي على بيانات مواد كافية يمكن الاعتماد عليها في التقدير.'
  }

  return 'لا توجد مشاريع سابقة تحتوي على تكاليف ورش كافية يمكن الاعتماد عليها في التقدير.'
}

export function ProjectMaterialEstimatePage() {
  const { id } = useParams<{ id: string }>()
  const [manualPrices, setManualPrices] = useState<Record<string, string>>({})

  const materialEstimateQuery = useProjectMaterialEstimate(id)
  const workshopEstimateQuery = useProjectWorkshopEstimate(id)
  const totalCostEstimateQuery = useProjectTotalCostEstimate(id)
  const costComparisonQuery = useProjectCostComparison(id)

  const materialData = materialEstimateQuery.data
  const workshopData = workshopEstimateQuery.data
  const totalCostData = totalCostEstimateQuery.data
  const costComparisonData = costComparisonQuery.data

  const resolvedMaterials = useMemo<ResolvedMaterialEstimateItem[]>(() => {
    return (materialData?.materials ?? []).map((material) => {
      const manualUnitPrice = parseManualPrice(manualPrices[material.materialId])
      const needsManualPrice = material.unitPrice === null
      const resolvedUnitPrice = material.unitPrice ?? manualUnitPrice
      const resolvedTotalPrice = needsManualPrice
        ? resolvedUnitPrice === null
          ? null
          : resolvedUnitPrice * material.estimatedQuantity
        : material.totalPrice ?? (resolvedUnitPrice === null ? null : resolvedUnitPrice * material.estimatedQuantity)

      return {
        ...material,
        needsManualPrice,
        resolvedUnitPrice,
        resolvedTotalPrice,
      }
    })
  }, [manualPrices, materialData?.materials])

  const missingMaterialPricesCount = resolvedMaterials.filter((material) => material.resolvedUnitPrice === null).length
  const materialGrandTotal = resolvedMaterials.reduce((total, material) => total + (material.resolvedTotalPrice ?? 0), 0)
  const manualMissingPricesTotal = resolvedMaterials.reduce((total, material) => {
    if (!material.needsManualPrice) return total
    return total + (material.resolvedTotalPrice ?? 0)
  }, 0)

  const workshopGrandTotal = useMemo(() => {
    if (workshopData?.grandTotalWorkshopCost !== null && workshopData?.grandTotalWorkshopCost !== undefined) {
      return workshopData.grandTotalWorkshopCost
    }

    return (workshopData?.workshops ?? []).reduce((total, workshop) => total + (workshop.estimatedCost ?? 0), 0)
  }, [workshopData?.grandTotalWorkshopCost, workshopData?.workshops])

  const materialsAvailable = Boolean(materialData?.estimationAvailable && materialData.materials.length > 0)
  const workshopsAvailable = Boolean(workshopData?.estimationAvailable && workshopData.workshops.length > 0)
  const totalEstimateAvailable = Boolean(totalCostData?.estimationAvailable)

  const displayedMaterialsTotal = totalEstimateAvailable && totalCostData?.estimatedMaterialsCost !== null
    ? (totalCostData?.estimatedMaterialsCost ?? 0) + manualMissingPricesTotal
    : materialsAvailable
      ? materialGrandTotal
      : null

  const displayedWorkshopsTotal = totalEstimateAvailable && totalCostData?.estimatedWorkshopsCost !== null
    ? totalCostData?.estimatedWorkshopsCost ?? 0
    : workshopsAvailable
      ? workshopGrandTotal
      : null

  const displayedOverallTotal = totalEstimateAvailable && totalCostData?.grandTotalEstimatedCost !== null
    ? (totalCostData?.grandTotalEstimatedCost ?? 0) + manualMissingPricesTotal
    : displayedMaterialsTotal !== null && displayedWorkshopsTotal !== null
      ? displayedMaterialsTotal + displayedWorkshopsTotal
      : null

  const projectName = totalCostData?.project.name
    ?? materialData?.project.name
    ?? workshopData?.project.name
    ?? costComparisonData?.project.name

  const isInitialLoading = materialEstimateQuery.isLoading
    && workshopEstimateQuery.isLoading
    && totalCostEstimateQuery.isLoading

  if (!id) {
    return (
      <ProjectDetailErrorState
        title="رابط المشروع غير صحيح"
        description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي."
      />
    )
  }

  function updateManualPrice(materialId: string, value: string) {
    setManualPrices((current) => ({
      ...current,
      [materialId]: value,
    }))
  }

  const comparisonAvailable = Boolean(
    costComparisonData?.estimatedCost.estimationAvailable
    && costComparisonData.estimatedCost.grandTotalEstimatedCost !== null,
  )

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white/50 px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]"
        >
          <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
          العودة إلى تفاصيل المشروع
        </Link>

        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_34px_rgb(var(--color-brand-ink-rgb)/0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-ink)] text-white shadow-[0_9px_20px_rgb(var(--color-brand-gold-rgb)/0.24)]">
              <BudgetIcon name="wallet" className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-slate-900">الميزانية</h1>
              {projectName ? <p className="mt-1 text-sm font-bold text-slate-500">{projectName}</p> : null}
              <p
                data-budget-estimation-note="header"
                className="mt-2 flex max-w-2xl items-start gap-1.5 text-xs font-semibold leading-5 text-slate-500"
              >
                <BudgetIcon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-ink)]" />
                <span>تم حساب التقدير والأسعار بالاستناد إلى مشاريعك السابقة وطبيعة عملك فيها.</span>
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-500 sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-[var(--color-brand-ink)]" />
            تقدير أولي
          </div>
        </header>

        {isInitialLoading ? (
          <LoadingState label="جاري حساب الميزانية التقديرية..." />
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_34px_rgb(var(--color-brand-ink-rgb)/0.05)]">
              <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-slate-100">
                <div className="px-5 py-5 sm:px-6">
                  <p className="text-xs font-extrabold text-slate-400">تقدير المواد</p>
                  <p className="mt-2 text-xl font-black tabular-nums text-slate-900">
                    {displayedMaterialsTotal === null ? 'غير متاح' : formatBudgetMoney(displayedMaterialsTotal)}
                  </p>
                  {displayedMaterialsTotal !== null && missingMaterialPricesCount > 0 ? (
                    <p className="mt-1.5 text-[11px] font-extrabold text-amber-600">لا يشمل {missingMaterialPricesCount} أسعار غير مدخلة</p>
                  ) : null}
                </div>

                <div className="border-t border-slate-100 px-5 py-5 sm:border-t-0 sm:px-6">
                  <p className="text-xs font-extrabold text-slate-400">تقدير أجور الورش</p>
                  <p className="mt-2 text-xl font-black tabular-nums text-slate-900">
                    {displayedWorkshopsTotal === null ? 'غير متاح' : formatBudgetMoney(displayedWorkshopsTotal)}
                  </p>
                </div>

                <div className="border-t border-slate-100 bg-[var(--color-legacy-f7-f9-f5)] px-5 py-5 sm:border-t-0 sm:px-6">
                  <p className="text-xs font-extrabold text-[rgb(var(--color-brand-ink-rgb)/0.7)]">التقدير الكلي للمشروع</p>
                  <p className="mt-2 text-2xl font-black tabular-nums text-[var(--color-brand-ink)]">
                    {displayedOverallTotal === null ? 'غير مكتمل' : formatBudgetMoney(displayedOverallTotal)}
                  </p>
                  {displayedOverallTotal !== null && missingMaterialPricesCount > 0 ? (
                    <p className="mt-1.5 text-[11px] font-extrabold text-amber-600">يتحدث تلقائياً بعد إدخال الأسعار الناقصة</p>
                  ) : null}
                </div>
              </div>
            </section>

            {costComparisonQuery.isLoading ? (
              <CostComparisonChartSkeleton />
            ) : costComparisonQuery.isError ? (
              <BudgetUnavailableState
                title="تعذر تحميل مقارنة التكلفة"
                description={getProjectsErrorMessage(costComparisonQuery.error)}
                onRetry={() => void costComparisonQuery.refetch()}
                isRetrying={costComparisonQuery.isFetching}
              />
            ) : !comparisonAvailable || !costComparisonData ? (
              <BudgetUnavailableState
                title="مقارنة التكلفة غير متاحة"
                description="لا توجد بيانات تقديرية كافية لمقارنة تكلفة المشروع الفعلية بالتقدير."
              />
            ) : (
              <CostComparisonChart data={costComparisonData} />
            )}

            {materialEstimateQuery.isLoading ? (
              <LoadingState compact label="جاري تحميل تقدير المواد..." />
            ) : materialEstimateQuery.isError ? (
              <BudgetUnavailableState
                title="تعذر تحميل تقدير المواد"
                description={getProjectsErrorMessage(materialEstimateQuery.error)}
                onRetry={() => void materialEstimateQuery.refetch()}
                isRetrying={materialEstimateQuery.isFetching}
              />
            ) : !materialsAvailable ? (
              <BudgetUnavailableState
                title="تقدير المواد غير متاح"
                description={getUnavailableDescription('materials')}
              />
            ) : (
              <MaterialEstimateTable
                items={resolvedMaterials}
                manualPrices={manualPrices}
                grandTotal={materialGrandTotal}
                missingPricesCount={missingMaterialPricesCount}
                onManualPriceChange={updateManualPrice}
              />
            )}

            {workshopEstimateQuery.isLoading ? (
              <LoadingState compact label="جاري تحميل تقدير أجور الورش..." />
            ) : workshopEstimateQuery.isError ? (
              <BudgetUnavailableState
                title="تعذر تحميل تقدير أجور الورش"
                description={getProjectsErrorMessage(workshopEstimateQuery.error)}
                onRetry={() => void workshopEstimateQuery.refetch()}
                isRetrying={workshopEstimateQuery.isFetching}
              />
            ) : !workshopsAvailable ? (
              <BudgetUnavailableState
                title="تقدير أجور الورش غير متاح"
                description={getUnavailableDescription('workshops')}
              />
            ) : (
              <WorkshopEstimateTable items={workshopData?.workshops ?? []} grandTotal={workshopGrandTotal} />
            )}
          </>
        )}
      </div>
    </section>
  )
}
