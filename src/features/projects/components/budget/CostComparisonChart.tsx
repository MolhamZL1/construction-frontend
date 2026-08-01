import { formatUsdCompactCurrency } from '@/utils/currency'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ProjectCostComparison } from '../../models/project-budget.model'
import { formatBudgetMoney, formatBudgetNumber } from './budget-formatters'

interface CostComparisonChartProps {
  data: ProjectCostComparison
}

interface ComparisonChartRow {
  name: string
  actual: number
  estimated: number
}

interface ComparisonTooltipProps {
  active?: boolean
  label?: string
  payload?: Array<{
    dataKey?: string | number
    value?: number | string
    color?: string
  }>
}

const ESTIMATED_COLOR = 'var(--color-brand-stone)'

function getStatusDetails(statusLabel: string | null, variance: number | null) {
  if (statusLabel === 'over_budget' || (statusLabel === null && variance !== null && variance > 0)) {
    return {
      label: 'أعلى من التقدير',
      actualColor: 'var(--color-legacy-dc6-b3-f)',
      badgeClassName: 'border-orange-200 bg-orange-50 text-orange-700',
    }
  }

  if (statusLabel === 'under_budget' || (statusLabel === null && variance !== null && variance < 0)) {
    return {
      label: 'أقل من التقدير',
      actualColor: 'var(--color-legacy3-f7-a57)',
      badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
  }

  return {
    label: 'ضمن التقدير',
    actualColor: 'var(--color-brand-ink)',
    badgeClassName: 'border-[rgb(var(--color-brand-gold-rgb)/0.25)] bg-[var(--color-legacy-f3-f6-f0)] text-[var(--color-brand-ink)]',
  }
}

function formatCompactMoney(value: number | string) {
  return formatUsdCompactCurrency(value)
}

function ComparisonTooltip({ active, label, payload }: ComparisonTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-44 rounded-2xl border border-slate-100 bg-white p-3.5 text-right shadow-xl" dir="rtl">
      <p className="mb-2 text-sm font-black text-slate-900">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => {
          const isActual = item.dataKey === 'actual'
          return (
            <div key={String(item.dataKey)} className="flex items-center justify-between gap-5 text-xs font-extrabold">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {isActual ? 'الفعلي' : 'التقديري'}
              </span>
              <span className="tabular-nums text-slate-800">{formatBudgetMoney(Number(item.value ?? 0))}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'positive' | 'negative' }) {
  const valueClassName = tone === 'negative'
    ? 'text-orange-700'
    : tone === 'positive'
      ? 'text-emerald-700'
      : 'text-slate-900'

  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0 first:pt-0 last:pb-0">
      <p className="text-[11px] font-extrabold text-slate-400">{label}</p>
      <p className={`mt-1 text-base font-black tabular-nums ${valueClassName}`}>{value}</p>
    </div>
  )
}

export function CostComparisonChart({ data }: CostComparisonChartProps) {
  const chartData = useMemo<ComparisonChartRow[]>(() => [
    {
      name: 'المواد',
      actual: data.actualCost.invoicesMaterialsCost,
      estimated: data.estimatedCost.estimatedMaterialsCost ?? 0,
    },
    {
      name: 'أجور الورش',
      actual: data.actualCost.workshopsExpensesCost,
      estimated: data.estimatedCost.estimatedWorkshopsCost ?? 0,
    },
    {
      name: 'إجمالي المشروع',
      actual: data.actualCost.netActualCost,
      estimated: data.estimatedCost.grandTotalEstimatedCost ?? 0,
    },
  ], [data])

  const status = getStatusDetails(data.comparison.statusLabel, data.comparison.variance)
  const variance = data.comparison.variance
  const varianceTone = variance === null || variance === 0 ? 'default' : variance > 0 ? 'negative' : 'positive'
  const variancePrefix = variance !== null && variance > 0 ? '+' : ''
  const percentagePrefix = data.comparison.variancePercentage !== null && data.comparison.variancePercentage > 0 ? '+' : ''

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_34px_rgb(var(--color-brand-ink-rgb)/0.05)]" dir="rtl">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-black text-slate-900">مقارنة التقدير بالتكلفة الفعلية</h2>
          <p className="mt-1 text-xs font-bold text-slate-400">المواد وأجور الورش وإجمالي المشروع</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${status.badgeClassName}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status.label}
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0 px-2 py-5 sm:px-5">
          <div className="h-[310px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%" barGap={5}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-neutral300)" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--color-legacy64748-b)', fontFamily: 'Cairo', fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={62}
                  tick={{ fontSize: 11, fill: 'var(--color-brand-stone)', fontFamily: 'Cairo' }}
                  tickFormatter={formatCompactMoney}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<ComparisonTooltip />} cursor={{ fill: 'rgb(var(--color-legacy-rgb94-a3-b8-rgb)/0.08)' }} />
                <Legend
                  iconType="circle"
                  iconSize={9}
                  wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12, fontWeight: 700, paddingTop: 16, direction: 'rtl' }}
                  formatter={(value) => value === 'actual' ? 'التكلفة الفعلية' : 'التكلفة التقديرية'}
                />
                <ReferenceLine y={0} stroke="var(--color-neutral400)" />
                <Bar dataKey="estimated" name="estimated" fill={ESTIMATED_COLOR} radius={[7, 7, 2, 2]} maxBarSize={48} />
                <Bar dataKey="actual" name="actual" radius={[7, 7, 2, 2]} maxBarSize={48}>
                  {chartData.map((item) => <Cell key={item.name} fill={status.actualColor} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 lg:border-r lg:border-t-0 lg:px-6">
          <Metric
            label="الفرق عن التقدير"
            value={variance === null ? '—' : `${variancePrefix}${formatBudgetMoney(variance)}`}
            tone={varianceTone}
          />
          <Metric
            label="نسبة الفرق"
            value={data.comparison.variancePercentage === null
              ? '—'
              : `${percentagePrefix}${formatBudgetNumber(data.comparison.variancePercentage)}%`}
            tone={varianceTone}
          />
          <Metric label="صافي التكلفة الفعلية" value={formatBudgetMoney(data.actualCost.netActualCost)} />
          {data.actualCost.returnsDeduction > 0 ? (
            <Metric label="حسم المرتجعات" value={`−${formatBudgetMoney(data.actualCost.returnsDeduction)}`} tone="positive" />
          ) : null}
        </aside>
      </div>
    </section>
  )
}

export function CostComparisonChartSkeleton() {
  return (
    <section className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_34px_rgb(var(--color-brand-ink-rgb)/0.05)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div className="space-y-2">
          <div className="h-5 w-52 rounded-lg bg-slate-200" />
          <div className="h-3 w-36 rounded bg-slate-100" />
        </div>
        <div className="h-8 w-28 rounded-full bg-slate-100" />
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_250px]">
        <div className="flex h-[350px] items-end justify-center gap-10 px-8 pb-16 pt-8">
          {[58, 82, 70, 48, 88, 76].map((height, index) => (
            <div key={`${height}-${index}`} className="w-9 rounded-t-lg bg-slate-100" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="hidden border-r border-slate-100 bg-slate-50/60 p-6 lg:block">
          <div className="space-y-6">
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </section>
  )
}
