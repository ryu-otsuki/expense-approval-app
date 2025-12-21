// app/composables/useRequests.ts
import type { ExpenseRequest, RequestStatus, Role } from '~/domain/request'
import { STATUS_TRANSITIONS } from '~/domain/request'
import { mockRequests } from '~/mocks/requests'

export const useRequests = () => {
  const requests = useState<ExpenseRequest[]>('requests', () => [...mockRequests])

  // UIから呼ぶ「更新API（モック）」を用意
  const updateStatus = (requestId: string, next: RequestStatus, role: Role) => {
    const target = requests.value.find(r => r.id === requestId)
    if (!target) return

    // 遷移ルールに従う（不正なら何もしない）
    const allowed = STATUS_TRANSITIONS[role][target.status]
    if (!allowed.includes(next)) return

    target.status = next
  }

  return {
    requests,
    updateStatus,
  }
}