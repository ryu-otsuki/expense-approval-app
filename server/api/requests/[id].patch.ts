import type { RequestStatus } from '../../../app/domain/request'
import { RequestsStore } from '../../data/requests.store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readBody<Partial<{ title: string; amountYen: number; status: RequestStatus }>>(event)

  const updated = RequestsStore.patch(id, body ?? {})
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  }
  return updated
})