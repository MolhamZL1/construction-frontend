import { useMemo, useState } from 'react'
import { DeleteUserDialog } from '../components/DeleteUserDialog'
import { ResetPasswordDialog } from '../components/ResetPasswordDialog'
import { ToggleStatusDialog } from '../components/ToggleStatusDialog'
import { UserFormDialog } from '../components/UserFormDialog'
import { UsersEmptyState } from '../components/UsersEmptyState'
import { UsersErrorState } from '../components/UsersErrorState'
import { UsersHeader } from '../components/UsersHeader'
import { UsersLoadingState } from '../components/UsersLoadingState'
import { UsersTable } from '../components/UsersTable'
import { UsersToolbar } from '../components/UsersToolbar'
import { getUsersErrorMessage, useDebouncedValue, useUsers } from '../hooks/useUsers'
import type { User, UserRoleFilter } from '../types/user.types'

type DialogState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'delete'; user: User }
  | { type: 'reset-password'; user: User }
  | { type: 'toggle-status'; user: User }

export function UsersPage() {
  const [role, setRole] = useState<UserRoleFilter>('all')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const debouncedSearch = useDebouncedValue(search, 300)
  const usersQuery = useUsers(role, debouncedSearch)
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])

  return (
    <section className="min-h-screen bg-white px-6 py-8" dir="rtl">
      <UsersHeader onAddUser={() => setDialog({ type: 'create' })} />

      <div className="mt-7 space-y-6">
        <UsersToolbar
          role={role}
          search={search}
          totalCount={users.length}
          onRoleChange={setRole}
          onSearchChange={setSearch}
        />

        {usersQuery.isError ? <UsersErrorState message={getUsersErrorMessage(usersQuery.error)} /> : null}
        {usersQuery.isLoading ? <UsersLoadingState /> : null}
        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? <UsersEmptyState /> : null}
        {!usersQuery.isLoading && users.length > 0 ? (
          <UsersTable
            users={users}
            onToggleStatus={(user) => setDialog({ type: 'toggle-status', user })}
            onResetPassword={(user) => setDialog({ type: 'reset-password', user })}
            onDelete={(user) => setDialog({ type: 'delete', user })}
          />
        ) : null}
      </div>

      <UserFormDialog open={dialog.type === 'create'} onClose={() => setDialog({ type: 'none' })} onSuccess={() => undefined} />
      <ToggleStatusDialog user={dialog.type === 'toggle-status' ? dialog.user : null} onClose={() => setDialog({ type: 'none' })} onSuccess={() => undefined} />
      <ResetPasswordDialog user={dialog.type === 'reset-password' ? dialog.user : null} onClose={() => setDialog({ type: 'none' })} onSuccess={() => undefined} />
      <DeleteUserDialog user={dialog.type === 'delete' ? dialog.user : null} onClose={() => setDialog({ type: 'none' })} onSuccess={() => undefined} />
    </section>
  )
}
