/** 申請者 / 承認者（将来増えてもここに足す） */
export type Role = 'applicant' | 'approver'

/** 申請の状態 */
export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

/** 経費申請（画面やAPIで使う形の基準） */
export type ExpenseRequest = {
  id: string
  title: string
  amountYen: number
  status: RequestStatus
  createdAt: string // YYYY-MM-DD 想定（今は簡易）
}

/** 状態の日本語ラベル（型安全に「全状態が必須」になる） */
export const STATUS_LABEL: Record<RequestStatus, string> = {
  draft: '下書き',
  submitted: '申請中',
  approved: '承認済み',
  rejected: '却下',
}

/** ロールごとの「できる状態遷移」 */
export const STATUS_TRANSITIONS: Record<Role, Record<RequestStatus, RequestStatus[]>> = {
  applicant: {
    draft: ['submitted'],
    submitted: [], // 申請者は申請後は触れない想定（必要なら後で調整）
    approved: [],
    rejected: [],
  },
  approver: {
    draft: [], // 承認者は下書きに触れない
    submitted: ['approved', 'rejected'],
    approved: [],
    rejected: [],
  },
}

// 編集できるかどうか（業務ルール）
export const canEdit = (status: RequestStatus): boolean => {
  return status === 'draft'
}