import { getUsersErrorMessage, useDeleteInternalUser, useToggleInternalUserStatus } from '../hooks/useUsers'
import type { InternalUser } from '../models/user.model'

interface UsersTableProps {
  users: InternalUser[]
}

const roleLabels: Record<InternalUser['role'], string> = {
  project_manager: 'مدير مشروع',
  assistant: 'مساعد',
  project_owner: 'مالك مشروع',
}

export function UsersTable({ users }: UsersTableProps) {
  const toggleStatusMutation = useToggleInternalUserStatus()
  const deleteUserMutation = useDeleteInternalUser()
  const mutationError = toggleStatusMutation.error ?? deleteUserMutation.error
  const errorMessage = mutationError ? getUsersErrorMessage(mutationError) : null

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {errorMessage ? <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">الاسم</th>
              <th className="px-4 py-3 font-medium">البريد</th>
              <th className="px-4 py-3 font-medium">المعرف الداخلي</th>
              <th className="px-4 py-3 font-medium">الدور</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  لا يوجد مستخدمون بعد. سيتم عرض المستخدمين الذين تنشئهم من هذه الصفحة مؤقتاً.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="text-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3" dir="ltr">{user.email}</td>
                  <td className="px-4 py-3">{user.internalId ?? 'غير محدد'}</td>
                  <td className="px-4 py-3">{roleLabels[user.role]}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleStatusMutation.mutate(user.id)}
                        disabled={toggleStatusMutation.isPending}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#50683f] hover:text-[#50683f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        تبديل الحالة
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUserMutation.mutate(user.id)}
                        disabled={deleteUserMutation.isPending}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: InternalUser['status'] }) {
  if (!status) {
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">غير معروف</span>
  }

  const isActive = status === 'active'

  return (
    <span className={isActive ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700' : 'rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600'}>
      {isActive ? 'نشط' : 'غير نشط'}
    </span>
  )
}
