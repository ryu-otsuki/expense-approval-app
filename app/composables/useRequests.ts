import type { ExpenseRequest, RequestStatus } from '~/domain/request'
import { mockRequests } from '~/mocks/requests'

export const useRequests = () => {
  const requests = useState<ExpenseRequest[]>('requests', () => [...mockRequests])

  const getAll = () => requests.value

  const getById = (id: string) => requests.value.find(r => r.id === id)

  const createDraft = (input: { title: string; amountYen: number }) => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const createdAt = `${yyyy}-${mm}-${dd}`

    const newRequest: ExpenseRequest = {
      id: crypto.randomUUID(),
      title: input.title,
      amountYen: input.amountYen,
      status: 'draft' satisfies RequestStatus,
      createdAt,
    }

    requests.value = [newRequest, ...requests.value]

    return newRequest
  }

  const updateStatus = (id: string, next: RequestStatus) => {
    const target = requests.value.find(r => r.id === id)
    if (!target) return false
    target.status = next
    return true
  }

  const updateDraft = (
  id: string,
  input: { title: string; amountYen: number }
) => {
  const target = requests.value.find(r => r.id === id)
  if (!target) return false
  if (target.status !== 'draft') return false

  target.title = input.title
  target.amountYen = input.amountYen
  return true
}

  return {
    requests,   
    getAll,
    getById,
    createDraft,
    updateStatus, 
    updateDraft,   
  }
}
