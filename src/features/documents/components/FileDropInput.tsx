import { DocumentIcon } from './DocumentIcon'

interface FileDropInputProps {
  file: File | null
  onChange: (file: File | null) => void
  accept?: string
  disabled?: boolean
}

function formatFileSize(size: number) {
  if (!size) {
    return '0 KB'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const power = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** power

  return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}

export function FileDropInput({ file, onChange, accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg', disabled = false }: FileDropInputProps) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-[#50683f]/40 hover:bg-[#50683f]/5">
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#50683f] shadow-sm transition group-hover:scale-105">
        <DocumentIcon name="upload" className="h-7 w-7" />
      </span>
      <span className="mt-4 text-base font-black text-slate-900">{file ? file.name : 'اختر ملف المستند'}</span>
      <span className="mt-1 text-sm font-semibold text-slate-500">
        {file ? formatFileSize(file.size) : 'PDF أو مستندات أو صور، ويمكن تغييره قبل الحفظ'}
      </span>
    </label>
  )
}
