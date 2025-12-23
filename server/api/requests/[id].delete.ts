import { RequestsStore } from '../../data/requests.store'
import type { Role } from '~/domain/request'
import { http404, http403 } from '../../utils/httpErrors'
import { requestService } from '~/domain/services/requestService'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const found = RequestsStore.get(id)
  if (!found) throw http404('Request not found')

  const role = (getQuery(event).role as Role) || 'applicant'
  if (!requestService.canDelete(role, found.status)) throw http403('Forbidden')

  const removed = RequestsStore.remove(id)
  if (!removed) throw http404('Request not found')

  return { ok: true }
})
