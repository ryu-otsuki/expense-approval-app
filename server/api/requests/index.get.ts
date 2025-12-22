import { RequestsStore } from '../../data/requests.store'

export default defineEventHandler(() => {
  return RequestsStore.list()
})