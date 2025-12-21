import type { ExpenseRequest } from '~/domain/request'

export const mockRequests: ExpenseRequest[] = [
  {
    id: '1',
    title: '出張交通費（福岡→東京）',
    amountYen: 17800,
    status: 'submitted',
    createdAt: '2025-12-20',
  },
  {
    id: '2',
    title: '書籍購入（業務改善）',
    amountYen: 3200,
    status: 'approved',
    createdAt: '2025-12-18',
  },
  {
    id: '3',
    title: '備品購入（マウス）',
    amountYen: 4980,
    status: 'draft',
    createdAt: '2025-12-17',
  },
]