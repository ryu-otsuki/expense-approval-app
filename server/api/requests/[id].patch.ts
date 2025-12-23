import { RequestsStore } from '../../data/requests.store'
import { getNextStatuses } from '~/domain/request'
import type { Role, RequestStatus } from '~/domain/request'
import { http404, http409 } from '../../utils/httpErrors'

type PatchBody = {
  role: Role
  nextStatus?: RequestStatus
  title?: string
  amountYen?: number
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const found = RequestsStore.get(id)
  if (!found) throw http404('Request not found')

  const body = await readBody<PatchBody>(event)

  // 状態遷移があるなら、domainのルールで判定
  if (body.nextStatus) {
    const allowed = getNextStatuses(body.role, found.status)
    if (!allowed.includes(body.nextStatus)) {
      throw http409('Invalid status transition')
    }
  }

  const updated = RequestsStore.patch(id, {
    ...(typeof body.title === 'string' ? { title: body.title } : {}),
    ...(typeof body.amountYen === 'number' ? { amountYen: body.amountYen } : {}),
    ...(body.nextStatus ? { status: body.nextStatus } : {}),
  })

  // patch側でも念のため（競合や並行を想定）
  if (!updated) throw http404('Request not found')

  return updated
})
