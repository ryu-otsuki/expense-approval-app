import { RequestsStore } from '../../data/requests.store'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ title?: string; amountYen?: number }>(event)

  const title = body?.title?.trim()
  const amountYen = body?.amountYen

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }
  if (typeof amountYen !== 'number' || Number.isNaN(amountYen) || amountYen <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'amountYen must be positive number' })
  }

  return RequestsStore.createDraft({ title, amountYen })
})