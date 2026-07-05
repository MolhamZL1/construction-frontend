import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DocumentFormShell } from '../components/DocumentFormShell'
import { DocumentUploadForm } from '../components/DocumentUploadForm'
import { getDocumentsErrorMessage, useUploadProjectDocument } from '../hooks/useDocuments'
import type { ProjectDocumentType } from '../models/document.model'

function getDocumentTypeFromSearch(value: string | null): ProjectDocumentType {
  return value === 'contract' ? 'contract' : 'document'
}

export function CreateProjectDocumentPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uploadDocumentMutation = useUploadProjectDocument()
  const documentType = getDocumentTypeFromSearch(searchParams.get('type'))
  const isContract = documentType === 'contract'
  const backTo = isContract ? `/projects/${id}/contracts` : `/projects/${id}/documents`

  if (!id) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-red-50 p-6 text-right text-red-700">
          رابط المشروع غير صحيح.
        </div>
      </section>
    )
  }

  return (
    <DocumentFormShell
      title={isContract ? 'رفع عقد جديد' : 'رفع مستند جديد'}
      description={
        isContract
          ? 'أضف عقداً للمشروع وسيظهر ضمن صفحة العقود فقط، بعيداً عن باقي المستندات.'
          : 'أضف مستنداً للمشروع مع أول إصدار له، وسيظهر ضمن صفحة المستندات.'
      }
      breadcrumbs={[
        { label: 'المشاريع', to: '/projects' },
        { label: isContract ? 'العقود' : 'المستندات', to: backTo },
        { label: isContract ? 'رفع عقد' : 'رفع مستند' },
      ]}
    >
      <DocumentUploadForm
        submitLabel={isContract ? 'رفع العقد' : 'رفع المستند'}
        cancelTo={backTo}
        hideCustomNameField
        titleLabel={isContract ? 'عنوان العقد' : 'عنوان المستند'}
        titlePlaceholder={isContract ? 'مثال: عقد الإكساء' : 'مثال: تقرير التربة'}
        isSubmitting={uploadDocumentMutation.isPending}
        errorMessage={uploadDocumentMutation.isError ? getDocumentsErrorMessage(uploadDocumentMutation.error) : null}
        onSubmit={(values) => {
          uploadDocumentMutation.mutate(
            {
              projectId: id,
              type: documentType,
              title: values.title ?? '',
              customName: values.customName,
              file: values.file,
            },
            {
              onSuccess: () => navigate(backTo),
            }
          )
        }}
      />
    </DocumentFormShell>
  )
}
