import type { Request } from '~/domain/request'

export const mockRequests: Request[] = [
  {
    id: 'req_001',
    title: '出張交通費（福岡→東京）',
    amount: 17800,
    status: 'submitted',
    createdAt: '2025-12-20',
  },
  {
    id: 'req_002',
    title: '書籍購入（業務改善）',
    amount: 3200,
    status: 'approved',
    createdAt: '2025-12-18',
  },
  {
    id: 'req_003',
    title: '備品購入（マウス）',
    amount: 4980,
    status: 'draft',
    createdAt: '2025-12-17',
  },
]
