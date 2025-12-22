import { RequestsStore } from '../../data/requests.store'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const found = RequestsStore.get(id)

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  }
  return found
})