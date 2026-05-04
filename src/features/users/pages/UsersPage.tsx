import { useState } from 'react'
import { CreateUserForm } from '../components/CreateUserForm'
import { UsersTable } from '../components/UsersTable'
import { useUsers } from '../hooks/useUsers'

export function UsersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const usersQuery = useUsers()

  return (
    <section className="space-y-6 px-6 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
          <p className="mt-2 text-sm text-slate-500">إضافة المستخدمين الداخليين وإدارة حالتهم.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((value) => !value)}
          className="rounded-lg bg-[#50683f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#435834]"
        >
          {showCreateForm ? 'إغلاق النموذج' : 'إضافة مستخدم'}
        </button>
      </div>

      {showCreateForm ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CreateUserForm onCreated={() => setShowCreateForm(false)} />
        </div>
      ) : null}

      <UsersTable users={usersQuery.data ?? []} />
    </section>
  )
}
