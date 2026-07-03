import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createWorkItemExpense, getWorkItemExpenses } from '../api/work-item-expenses.api'
import type { CreateWorkItemExpenseInput, WorkItemExpensesFilter } from '../models/work-item-expense.model'

const WORK_ITEM_EXPENSES_QUERY_KEY = ['work-item-expenses'] as const

export const workItemExpensesKeys = {
  all: WORK_ITEM_EXPENSES_QUERY_KEY,
  project: (projectId: string) => [...WORK_ITEM_EXPENSES_QUERY_KEY, projectId] as const,
  list: (filter: WorkItemExpensesFilter) =>
    [...WORK_ITEM_EXPENSES_QUERY_KEY, filter.projectId, filter.workItemId, filter.from, filter.to] as const,
}

interface UseWorkItemExpensesOptions {
  enabled?: boolean
}

export function useWorkItemExpenses(filter: WorkItemExpensesFilter, options: UseWorkItemExpensesOptions = {}) {
  return useQuery({
    queryKey: workItemExpensesKeys.list(filter),
    queryFn: () => getWorkItemExpenses(filter),
    enabled: Boolean(filter.projectId && filter.workItemId && filter.from && filter.to) && (options.enabled ?? true),
  })
}

export function useCreateWorkItemExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateWorkItemExpenseInput) => createWorkItemExpense(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: workItemExpensesKeys.project(variables.projectId) })
    },
  })
}
