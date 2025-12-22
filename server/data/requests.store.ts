import type { ExpenseRequest, RequestStatus } from '../../app/domain/request'
import { mockRequests } from '../../app/mocks/requests'

type CreateInput = {
  title: string
  amountYen: number
}

type PatchInput = Partial<{
  title: string
  amountYen: number
  status: RequestStatus
}>

// メモリ上のDB（サーバー再起動で初期化される）
let requests: ExpenseRequest[] = [...mockRequests]

const formatYYYYMMDD = (d = new Date()) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const RequestsStore = {
  list(): ExpenseRequest[] {
    return requests
  },

  get(id: string): ExpenseRequest | undefined {
    return requests.find(r => r.id === id)
  },

  createDraft(input: CreateInput): ExpenseRequest {
    const newRequest: ExpenseRequest = {
      id: globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2),
      title: input.title,
      amountYen: input.amountYen,
      status: 'draft',
      createdAt: formatYYYYMMDD(),
    }
    requests = [newRequest, ...requests]
    return newRequest
  },

  patch(id: string, input: PatchInput): ExpenseRequest | undefined {
    const current = requests.find(r => r.id === id)
    if (!current) return undefined

    // 最小限：来たものだけ反映
    if (typeof input.title === 'string') current.title = input.title
    if (typeof input.amountYen === 'number') current.amountYen = input.amountYen
    if (typeof input.status === 'string') current.status = input.status

    return current
  },

  remove(id: string): boolean {
    const before = requests.length
    requests = requests.filter(r => r.id !== id)
    return requests.length !== before
  },
}