export interface WorkItemExpenseProject {
  id: string
  name: string
}

export interface WorkItemExpenseWorkItem {
  id: string
  name: string
}

export interface WorkItemExpenseAuthor {
  id: string
  name: string
}

export interface WorkItemExpense {
  id: string
  amount: string
  description: string
  createdBy: WorkItemExpenseAuthor | null
  createdAt: string
}

export interface WorkItemExpensesSummary {
  project: WorkItemExpenseProject | null
  workItem: WorkItemExpenseWorkItem | null
  from: string
  to: string
  totalAmount: number
  expenses: WorkItemExpense[]
}

export interface WorkItemExpensesFilter {
  projectId: string
  workItemId: string
  from: string
  to: string
}

export interface CreateWorkItemExpenseInput {
  projectId: string
  workItemId: string
  amount: string
  description: string
}
