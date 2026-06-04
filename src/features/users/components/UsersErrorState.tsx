interface UsersErrorStateProps {
  message?: string
}

export function UsersErrorState({ message = 'حدث خطأ أثناء جلب البيانات' }: UsersErrorStateProps) {
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-right text-sm font-medium text-rose-700 shadow-sm">{message}</div>
}
