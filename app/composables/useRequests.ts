import type { ExpenseRequest, RequestStatus } from '~/domain/request'
import { mockRequests } from '~/mocks/requests'

export const useRequests = () => {
  const requests = useState<ExpenseRequest[]>('requests', () => [...mockRequests])

  const getAll = () => requests.value

  const getById = (id: string) => requests.value.find(r => r.id === id)

  // 追加：draft作成
  const createDraft = (input: { title: string; amountYen: number }) => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const createdAt = `${yyyy}-${mm}-${dd}`

    const newRequest: ExpenseRequest = {
      id: crypto.randomUUID(), // Node/ブラウザ対応（NuxtならOKなことが多い）
      title: input.title,
      amountYen: input.amountYen,
      status: 'draft' satisfies RequestStatus,
      createdAt,
    }

    // 一覧の先頭に追加（好みで末尾でもOK）
    requests.value = [newRequest, ...requests.value]

    return newRequest
  }

  // 追加：（任意）状態更新もここに寄せるなら
  const updateStatus = (id: string, next: RequestStatus) => {
    const target = requests.value.find(r => r.id === id)
    if (!target) return false
    target.status = next
    return true
  }

  return {
    requests,      // 直接触りたくなければ export しなくてもOK
    getAll,
    getById,
    createDraft,
    updateStatus,  // 任意
  }
}
