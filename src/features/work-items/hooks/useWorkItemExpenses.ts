import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addWorkItemExpense,
  getWorkItemExpenses,
  type AddWorkItemExpenseInput,
  type GetWorkItemExpensesInput,
} from '../api/work-item-expenses.api'

export const workItemExpensesKeys = {
  all: ['work-item-expenses'] as const,
  list: (projectId: string, workItemId: string, from?: string, to?: string) =>
    [...workItemExpensesKeys.all, projectId, workItemId, from ?? '', to ?? ''] as const,
}

export function useWorkItemExpenses(input: GetWorkItemExpensesInput | null) {
  return useQuery({
    queryKey: input
      ? workItemExpensesKeys.list(input.projectId, input.workItemId, input.from, input.to)
      : workItemExpensesKeys.list('', '', '', ''),
    queryFn: () => getWorkItemExpenses(input as GetWorkItemExpensesInput),
    enabled: Boolean(input?.projectId && input?.workItemId),
  })
}

export function useAddWorkItemExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddWorkItemExpenseInput) => addWorkItemExpense(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: workItemExpensesKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['work-items', 'list', input.projectId] })
    },
  })
}
