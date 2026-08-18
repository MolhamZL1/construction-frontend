import { useEffect, useState } from 'react'

import { UserFormDialog } from '@/features/users/components/UserFormDialog'

import { CustomerSatisfactionChart } from '../components/CustomerSatisfactionChart'
import { OngoingProjectsTable } from '../components/OngoingProjectsTable'
import { OnTimeDeliveryChart } from '../components/OnTimeDeliveryChart'
import { DashboardAiInspectionPanel } from '../components/DashboardAiInspectionPanel'
import { DashboardQuickActions } from '../components/DashboardQuickActions'
import {
  useDashboardCustomerSatisfaction,
  useDashboardDeliveryPerformance,
  useDashboardOngoingProjects,
} from '../hooks/useDashboard'

export function DashboardPage() {
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const satisfactionQuery = useDashboardCustomerSatisfaction()
  const ongoingProjectsQuery = useDashboardOngoingProjects()
  const deliveryPerformanceQuery = useDashboardDeliveryPerformance()

  useEffect(() => {
    if (!successMessage) return

    const timeout = window.setTimeout(() => setSuccessMessage(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [successMessage])

  return (
    <section className="min-h-screen bg-white px-4 py-6 text-right sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-[1560px]">
        <DashboardQuickActions onAddUser={() => setUserDialogOpen(true)} />

        {successMessage ? (
          <div className="mt-4 w-fit max-w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(330px,0.72fr)]" dir="ltr">
          <div className="min-w-0" dir="rtl">
            <CustomerSatisfactionChart
              data={satisfactionQuery.data}
              isLoading={satisfactionQuery.isLoading}
              isError={satisfactionQuery.isError}
            />
          </div>

          <div className="min-w-0" dir="rtl">
            <OnTimeDeliveryChart
              data={deliveryPerformanceQuery.data}
              isLoading={deliveryPerformanceQuery.isLoading}
              isError={deliveryPerformanceQuery.isError}
              onRetry={() => deliveryPerformanceQuery.refetch()}
            />
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.38fr)_minmax(370px,0.62fr)]" dir="ltr">
          <div className="min-w-0" dir="rtl">
            <OngoingProjectsTable
              projects={ongoingProjectsQuery.data ?? []}
              isLoading={ongoingProjectsQuery.isLoading}
              isError={ongoingProjectsQuery.isError}
              onRetry={() => ongoingProjectsQuery.refetch()}
            />
          </div>

          <div className="min-w-0" dir="rtl">
            <DashboardAiInspectionPanel />
          </div>
        </div>
      </div>

      <UserFormDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        onSuccess={(message) => setSuccessMessage(message)}
      />
    </section>
  )
}
