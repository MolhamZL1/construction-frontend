import { Link } from 'react-router-dom'
import { MaterialIcon } from './MaterialIcon'

export function MaterialsPageHeader() {
  return (
    <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 text-right">
      
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">المواد</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
        إدارة جميع المواد والخامات المستخدمة في المشاريع </p>
        </div>

        <Link
          to="/materials/create"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#50683f] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#405433]"
        >
          <MaterialIcon name="plus" className="h-4 w-4" />
          إضافة مادة
        </Link>
      </div>
    </header>
  )
}
