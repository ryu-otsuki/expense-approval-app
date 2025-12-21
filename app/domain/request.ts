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

/**
 * 指定ロール/状態で「次に遷移できる状態一覧」を返す
 * UI側はこれを使ってボタン表示を決める（業務ルールをUIに散らさない）
 */
export const getNextStatuses = (role: Role, status: RequestStatus): readonly RequestStatus[] => {
  return STATUS_TRANSITIONS[role][status]
}

/**
 * draftのみ編集可能（Issue #23 のルール）
 * UI側で status === 'draft' を直書きしないための関数
 */
export const canEdit = (status: RequestStatus): boolean => {
  return status === 'draft'
}

/**
 * draftのみ削除可能（Issue #24 のルール）
 * UI側で status === 'draft' を直書きしないための関数
 */
export const canDelete = (status: RequestStatus): boolean => {
  return status === 'draft'
}