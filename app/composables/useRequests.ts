import { mockRequests } from '~/mocks/requests'
import type { ExpenseRequest, RequestStatus } from '~/domain/request'
import { STATUS_TRANSITIONS } from '~/domain/request'

export const useRequests = () => {
  // useState でアプリ全体の共有状態にする
  const requests = useState<ExpenseRequest[]>('requests', () => [...mockRequests])

  const getById = (id: string): ExpenseRequest | undefined => {
    return requests.value.find((r) => r.id === id)
  }

  // status更新（モック更新：UIに反映させるため）
  const updateStatus = (id: string, next: RequestStatus) => {
    const target = requests.value.find((r) => r.id === id)
    if (!target) return
    target.status = next
  }

  // 「今のロールなら次に何へ遷移できるか」を返す
  const getNextStatuses = (role: keyof typeof STATUS_TRANSITIONS, status: RequestStatus) => {
    return STATUS_TRANSITIONS[role][status]
  }

  return {
    requests,
    getById,
    updateStatus,
    getNextStatuses,
  }
}
