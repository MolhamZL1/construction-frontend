import { Link } from 'react-router-dom'
import { getMaterialUnitLabel } from '../constants/material-units'
import type { Material } from '../models/material.model'
import { getMaterialInitials } from '../utils/materials-formatters'
import { MaterialIcon } from './MaterialIcon'

interface MaterialsTableProps {
  materials: Material[]
  onDelete: (material: Material) => void
  onManageWorkItems: (material: Material) => void
}

export function MaterialsTable({ materials, onDelete, onManageWorkItems }: MaterialsTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-extrabold">#</th>
              <th className="px-5 py-4 font-extrabold">اسم المادة</th>
              <th className="px-5 py-4 font-extrabold">وحدة القياس</th>
              <th className="px-5 py-4 font-extrabold">البنود المرتبطة</th>
              <th className="px-5 py-4 font-extrabold">الإجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {materials.map((material, index) => (
              <tr key={material.id} className="text-slate-600 transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-bold text-slate-400">{index + 1}</td>
                <td className="px-5 py-4">
                  <MaterialIdentity material={material} />
                </td>
                <td className="px-5 py-4">
                  <UnitBadge unit={material.unit} />
                </td>
                <td className="max-w-xl px-5 py-4">
                  <WorkItemNames names={material.workItemNames} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <IconActionButton label="ربط ببند" icon="link" onClick={() => onManageWorkItems(material)} />
                    <IconActionButton to={`/materials/${material.id}/edit`} label="تعديل" icon="edit" />
                    <IconActionButton label="حذف" icon="delete" tone="danger" onClick={() => onDelete(material)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {materials.map((material) => (
          <article key={material.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <MaterialIdentity material={material} />
              <UnitBadge unit={material.unit} />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="mb-3 text-xs font-black text-slate-400">البنود المرتبطة</p>
              <WorkItemNames names={material.workItemNames} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <IconActionButton label="ربط ببند" icon="link" onClick={() => onManageWorkItems(material)} />
              <IconActionButton to={`/materials/${material.id}/edit`} label="تعديل" icon="edit" />
              <IconActionButton label="حذف" icon="delete" tone="danger" onClick={() => onDelete(material)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function MaterialIdentity({ material }: { material: Material }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4eb] text-sm font-black text-[#50683f]">
        {getMaterialInitials(material.name)}
      </span>
      <div className="min-w-0 text-right">
        <p className="truncate font-black text-slate-950">{material.name}</p>
        <p className="mt-1 text-xs font-bold text-slate-400">معرف المادة: {material.id}</p>
      </div>
    </div>
  )
}

function UnitBadge({ unit }: { unit: string }) {
  return (
    <span className="inline-flex min-h-9 items-center justify-center rounded-2xl bg-slate-100 px-3 text-xs font-black text-slate-600">
      {getMaterialUnitLabel(unit)}
    </span>
  )
}

function WorkItemNames({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <span className="inline-flex rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-400">غير مرتبطة بأي بند</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {names.map((name) => (
        <span
          key={name}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#50683f]/15 bg-[#eef4eb] px-3 py-2 text-xs font-black text-[#50683f]"
        >
          <span className="h-2 w-2 rounded-full bg-[#50683f]" />
          {name}
        </span>
      ))}
    </div>
  )
}

interface IconActionButtonProps {
  label: string
  icon: 'edit' | 'delete' | 'link'
  tone?: 'default' | 'danger'
  to?: string
  onClick?: () => void
}

function IconActionButton({ label, icon, tone = 'default', to, onClick }: IconActionButtonProps) {
  const className = tone === 'danger'
    ? 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100'
    : 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#50683f] transition hover:border-[#50683f] hover:bg-[#eef4eb]'

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} title={label}>
        <MaterialIcon name={icon} />
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label} title={label}>
      <MaterialIcon name={icon} />
    </button>
  )
}
