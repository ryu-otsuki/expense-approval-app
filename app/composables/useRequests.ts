import { mockRequests } from '~/mocks/requests'
import type { ExpenseRequest, RequestStatus } from '~/domain/request'
import { canDelete, canEdit } from '~/domain/request'

type CreateDraftInput = {
  title: string
  amountYen: number
}

type UpdateDraftInput = {
  title: string
  amountYen: number
}

// YYYY-MM-DD
const formatDateYYYYMMDD = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Node/ブラウザで randomUUID が無い可能性があるので fallback
const generateId = () => {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export const useRequests = () => {
  // Nuxt推奨: useState でアプリ全体の共有状態にする
  const requests = useState<ExpenseRequest[]>('requests', () => [...mockRequests])

  // 一覧取得
  const getAll = () => requests.value

  // 1件取得
  const getById = (id: string) => requests.value.find((r) => r.id === id)

  // 下書き作成（/requests/new 用）
  const createDraft = (input: CreateDraftInput) => {
    const newRequest: ExpenseRequest = {
      id: generateId(),
      title: input.title,
      amountYen: input.amountYen,
      status: 'draft',
      createdAt: formatDateYYYYMMDD(new Date()),
    }

    // 先頭に追加（末尾にしたいなら [...requests.value, newRequest]）
    requests.value = [newRequest, ...requests.value]

    return newRequest
  }

  // 状態更新（遷移ボタン用）
  const updateStatus = (id: string, next: RequestStatus) => {
    const idx = requests.value.findIndex((r) => r.id === id)
    if (idx === -1) return false

    // findIndex 済みなので必ず存在する（TSにも明確にする）
    const current = requests.value[idx]!
    requests.value[idx] = { ...current, status: next }
    return true
  }

  // draftの内容更新（/requests/:id/edit 用）
  // MVP: role 判定は UI ではなく domain(useAuthMockのrole) でやりたいが、
  // useRequests は role を知らないので「draftかどうか」だけを厳密に守る。
  // roleまで見るなら updateDraft(role, ...) にする or composableを分ける。
  const updateDraft = (id: string, input: UpdateDraftInput) => {
    const idx = requests.value.findIndex((r) => r.id === id)
    if (idx === -1) return false

    const current = requests.value[idx]!
    // domainルール（draftのみ編集可）を利用
    // roleはここでは不明なので applicant 固定（擬似ログインを強制したいなら引数で受ける設計に）
    if (!canEdit('applicant', current.status)) return false

    requests.value[idx] = {
      ...current,
      title: input.title,
      amountYen: input.amountYen,
    }
    return true
  }

  // draft削除（詳細 or 一覧の削除ボタン用）
  const deleteDraft = (id: string) => {
    const target = getById(id)
    if (!target) return false

    // domainルール（draftのみ削除可）
    if (!canDelete('applicant', target.status)) return false

    requests.value = requests.value.filter((r) => r.id !== id)
    return true
  }

  return {
    // 基本は関数経由で触る（requests を直参照しない）
    getAll,
    getById,
    createDraft,
    updateStatus,
    updateDraft,
    deleteDraft,
  }
}