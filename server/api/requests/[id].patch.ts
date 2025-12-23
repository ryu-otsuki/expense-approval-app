import { RequestsStore } from '../../data/requests.store'
import type { Role, RequestStatus } from '~/domain/request'
import { http404, http409 } from '../../utils/httpErrors'
import { requestService } from '~/domain/services/requestService'

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

  if (body.nextStatus) {
    const allowed = requestService.getAvailableTransitions(body.role, found.status)
    if (!allowed.includes(body.nextStatus)) {
      throw http409('Invalid status transition')
    }
  }

  const updated = RequestsStore.patch(id, {
    ...(typeof body.title === 'string' ? { title: body.title } : {}),
    ...(typeof body.amountYen === 'number' ? { amountYen: body.amountYen } : {}),
    ...(body.nextStatus ? { status: body.nextStatus } : {}),
  })

  if (!updated) throw http404('Request not found')

  return updated
})
