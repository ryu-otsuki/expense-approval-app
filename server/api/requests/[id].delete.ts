import { RequestsStore } from '../../data/requests.store'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const ok = RequestsStore.remove(id)

  if (!ok) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  }
  return { ok: true }
})