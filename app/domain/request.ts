export type Role = 'applicant' | 'approver'

export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export type ExpenseRequest = {
  id: string
  title: string
  amountYen: number
  status: RequestStatus
  createdAt: string 
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  draft: '下書き',
  submitted: '申請中',
  approved: '承認済み',
  rejected: '却下',
}

export const STATUS_TRANSITIONS: Record<Role, Record<RequestStatus, RequestStatus[]>> = {
  applicant: {
    draft: ['submitted'],
    submitted: [],
    approved: [],
    rejected: [],
  },
  approver: {
    draft: [],
    submitted: ['approved', 'rejected'],
    approved: [],
    rejected: [],
  },
}
