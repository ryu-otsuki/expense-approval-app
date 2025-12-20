export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export type Request = {
  id: string
  title: string
  amount: number
  status: RequestStatus
  createdAt: string // ISO date (簡易)
}
