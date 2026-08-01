import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatArabicDate } from '../utils/formatArabicDate'
import type { User } from '../types/user.types'
import { RoleBadge } from './RoleBadge'
import { StatusBadge } from './StatusBadge'

interface UsersTableProps {
  users: User[]
  onToggleStatus: (user: User) => void
  onResetPassword: (user: User) => void
  onDelete: (user: User) => void
}

type UserActions = Pick<UsersTableProps, 'onToggleStatus' | 'onResetPassword' | 'onDelete'>

export function UsersTable({
  users,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: UsersTableProps) {
  return (
    <section
      dir="rtl"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgb(var(--color-brand-ink-rgb)/0.10)]"
    >
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead className="bg-[var(--color-brand-paper)] text-[var(--color-brand-stone)]">
              <tr>
                <th className="px-5 py-4 font-semibold">المستخدم</th>
                <th className="px-5 py-4 font-semibold">الدور</th>
                <th className="px-5 py-4 font-semibold">الحالة</th>
                <th className="px-5 py-4 font-semibold">تاريخ الإنشاء</th>
                <th className="px-5 py-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((user, index) => (
                <UserRow
                  key={`${user.id ?? 'user'}-${index}`}
                  user={user}
                  onToggleStatus={onToggleStatus}
                  onResetPassword={onResetPassword}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {users.map((user, index) => (
          <UserCard
            key={`${user.id ?? 'user'}-${index}`}
            user={user}
            onToggleStatus={onToggleStatus}
            onResetPassword={onResetPassword}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  )
}

function UserRow({
  user,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: UserActions & { user: User }) {
  const navigate = useNavigate()

  return (
    <tr className="text-[var(--color-brand-stone)] transition hover:bg-[var(--color-brand-paper)]">
      <td className="px-5 py-4">
        <UserIdentity user={user} />
      </td>

      <td className="px-5 py-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={user.status} />
      </td>

      <td className="px-5 py-4 font-medium">
        {formatArabicDate(user.created_at)}
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          <IconActionButton
            label="عرض التفاصيل"
            icon="view"
            onClick={() => navigateToDetails(navigate, user)}
            disabled={!user.id}
          />

          <IconActionButton
            label="تغيير الحالة"
            icon="power"
            onClick={() => onToggleStatus(user)}
            disabled={!user.id}
          />

          <IconActionButton
            label="إعادة كلمة المرور"
            icon="reset"
            onClick={() => onResetPassword(user)}
            disabled={!user.id}
          />

          <IconActionButton
            label="حذف"
            icon="delete"
            tone="danger"
            onClick={() => onDelete(user)}
            disabled={!user.id}
          />
        </div>
      </td>
    </tr>
  )
}

function UserCard({
  user,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: UserActions & { user: User }) {
  const navigate = useNavigate()

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 text-right shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <UserIdentity user={user} />
        <StatusBadge status={user.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <InfoLine label="الدور" value={<RoleBadge role={user.role} />} />
        <InfoLine label="تاريخ الإنشاء" value={formatArabicDate(user.created_at)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <IconActionButton
          label="عرض التفاصيل"
          icon="view"
          onClick={() => navigateToDetails(navigate, user)}
          disabled={!user.id}
        />

        <IconActionButton
          label="تغيير الحالة"
          icon="power"
          onClick={() => onToggleStatus(user)}
          disabled={!user.id}
        />

        <IconActionButton
          label="إعادة كلمة المرور"
          icon="reset"
          onClick={() => onResetPassword(user)}
          disabled={!user.id}
        />

        <IconActionButton
          label="حذف"
          icon="delete"
          tone="danger"
          onClick={() => onDelete(user)}
          disabled={!user.id}
        />
      </div>
    </article>
  )
}

function UserIdentity({ user }: { user: User }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[var(--color-brand-ink)]">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20 21a8 8 0 0 0-16 0" strokeLinecap="round" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      </div>

      <div className="min-w-0 text-right">
        <p className="truncate font-semibold text-[var(--color-brand-ink)]">
          {user.name ?? '—'}
        </p>

        <p className="mt-1 truncate text-xs font-medium text-[var(--color-brand-stone)]" dir="ltr">
          {user.internal_id ?? '—'}
        </p>
      </div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 text-slate-800">{value}</span>
    </div>
  )
}

function IconActionButton({
  label,
  icon,
  onClick,
  disabled,
  tone = 'default',
}: {
  label: string
  icon: 'view' | 'power' | 'reset' | 'delete'
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        tone === 'danger'
          ? 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-danger)] transition hover:bg-[rgb(var(--color-danger-rgb)/0.1)] disabled:cursor-not-allowed disabled:opacity-50'
          : 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-brand-stone)] transition hover:bg-slate-100 hover:text-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-50'
      }
      aria-label={label}
      title={label}
    >
      <ActionIcon name={icon} />
    </button>
  )
}

function ActionIcon({ name }: { name: 'view' | 'power' | 'reset' | 'delete' }) {
  if (name === 'delete') {
    return (
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'reset') {
    return (
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M4 12a8 8 0 1 0 2.35-5.65L4 8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'power') {
    return (
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 3v10M17.65 6.35a8 8 0 1 1-11.3 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function navigateToDetails(navigate: ReturnType<typeof useNavigate>, user: User) {
  if (!user.id) {
    return
  }

  navigate(`/users/${user.id}`, { state: { user } })
}