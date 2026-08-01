import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentIcon } from './DocumentIcon'
import { FileDropInput } from './FileDropInput'

interface DocumentUploadFormValues {
  title?: string
  customName?: string
  file: File | null
}

interface DocumentUploadFormProps {
  submitLabel: string
  cancelTo: string
  initialValues?: Partial<DocumentUploadFormValues>
  hideTitleFields?: boolean
  hideCustomNameField?: boolean
  customNameLabel?: string
  customNamePlaceholder?: string
  customNameHelpText?: string
  titleLabel?: string
  titlePlaceholder?: string
  isSubmitting?: boolean
  errorMessage?: string | null
  onSubmit: (values: DocumentUploadFormValues & { file: File }) => void
}

const fieldClassName =
  'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-gold)] focus:bg-white focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]'

export function DocumentUploadForm({
  submitLabel,
  cancelTo,
  initialValues,
  hideTitleFields = false,
  hideCustomNameField = false,
  customNameLabel = 'اسم الملف داخل النظام',
  customNamePlaceholder = 'مثال: contract-v1',
  customNameHelpText = 'سيُرسل هذا الحقل باسم custom_name حسب API.',
  titleLabel = 'عنوان الملف',
  titlePlaceholder = 'مثال: عقد المشروع',
  isSubmitting = false,
  errorMessage,
  onSubmit,
}: DocumentUploadFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [customName, setCustomName] = useState(initialValues?.customName ?? '')
  const [file, setFile] = useState<File | null>(initialValues?.file ?? null)
  const [localError, setLocalError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedTitle = title.trim()
    const normalizedCustomName = customName?.trim()
    const generatedCustomName = hideCustomNameField ? normalizedTitle : normalizedCustomName

    if (!hideTitleFields && !normalizedTitle) {
      setLocalError(`${titleLabel} مطلوب.`)
      return
    }

    if (!hideCustomNameField && !generatedCustomName) {
      setLocalError(`${customNameLabel} مطلوب.`)
      return
    }

    if (!file) {
      setLocalError('يرجى اختيار ملف للرفع.')
      return
    }

    setLocalError(null)
    onSubmit({
      title: normalizedTitle,
      customName: generatedCustomName,
      file,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!hideTitleFields ? (
        <label className="block space-y-2">
          <span className="block text-sm font-black text-slate-700">{titleLabel}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={fieldClassName}
            placeholder={titlePlaceholder}
            disabled={isSubmitting}
          />
        </label>
      ) : null}

      {!hideCustomNameField ? (
        <label className="block space-y-2">
          <span className="block text-sm font-black text-slate-700">{customNameLabel}</span>
          <input
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            className={fieldClassName}
            placeholder={customNamePlaceholder}
            disabled={isSubmitting}
            dir="ltr"
          />
          <span className="block text-xs font-semibold text-slate-400">{customNameHelpText}</span>
        </label>
      ) : null}

      <FileDropInput file={file} onChange={setFile} disabled={isSubmitting} />

      {localError || errorMessage ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {localError ?? errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
        <Link
          to={cancelTo}
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-ink)] px-7 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DocumentIcon name="upload" className="h-5 w-5" />
          {isSubmitting ? 'جاري الرفع...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
