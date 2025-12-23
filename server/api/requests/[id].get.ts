import { RequestsStore } from '../../data/requests.store'
import { http404 } from '../../utils/httpErrors'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const found = RequestsStore.get(id)

  if (!found) throw http404('Request not found')
  return found
})
