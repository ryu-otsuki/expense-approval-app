import type { ExpenseRequest, RequestStatus } from '~/domain/request'
import { canDelete, canEdit } from '~/domain/request'
import { mockRequests } from '~/mocks/requests'

type CreateDraftInput = {
  title: string
  amountYen: number
}

type UpdateDraftInput = {
  title: string
  amountYen: number
}

const formatDateYYYYMMDD = (d = new Date()) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const useRequests = () => {
  // Nuxt推奨: useState でアプリ全体の共有状態にする
  const requests = useState<ExpenseRequest[]>('requests', () => [...mockRequests])

  // 一覧取得（UIはこれだけ見ればいい）
  const getAll = () => requests.value

  // id検索（詳細/編集で使う）
  const getById = (id: string) => requests.value.find((r) => r.id === id)

  // draft作成
  const createDraft = (input: CreateDraftInput) => {
    const newRequest: ExpenseRequest = {
      id: crypto.randomUUID(),
      title: input.title,
      amountYen: input.amountYen,
      status: 'draft' satisfies RequestStatus,
      createdAt: formatDateYYYYMMDD(),
    }

    requests.value = [newRequest, ...requests.value]
    return newRequest
  }

  // 状態更新（すでに #11 で使ってる想定）
  // ※ 型エラー回避のため「配列の要素を直接変更」にする（Vueは追跡できる）
  const updateStatus = (id: string, next: RequestStatus) => {
    const target = requests.value.find((r) => r.id === id)
    if (!target) return false
    target.status = next
    return true
  }

  // draftの内容更新（#23）
  const updateDraft = (id: string, input: UpdateDraftInput) => {
    const target = requests.value.find((r) => r.id === id)
    if (!target) return false
    if (!canEdit(target.status)) return false

    target.title = input.title
    target.amountYen = input.amountYen
    return true
  }

  // 削除（#24）
  const deleteById = (id: string) => {
    const target = requests.value.find((r) => r.id === id)
    if (!target) return false
    if (!canDelete(target.status)) return false

    requests.value = requests.value.filter((r) => r.id !== id)
    return true
  }

  return {
    // stateを直接触らせたくないなら requests は返さなくてもOK
    requests,

    getAll,
    getById,

    createDraft,
    updateStatus,

    updateDraft,
    deleteById,
  }
}