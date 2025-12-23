import type { ExpenseRequest, RequestStatus, Role } from '~/domain/request'
import type { DomainError } from '~/domain/error'
import { notFound, forbidden, conflict } from '~/domain/error'
import { useAuthMock } from '~/composables/useAuthMock'

type CreateDraftInput = {
  title: string
  amountYen: number
}

type UpdateDraftInput = {
  title: string
  amountYen: number
}

type FetchErrorLike = {
  statusCode?: number
  status?: number
  message?: string
}

const asFetchErrorLike = (e: unknown): FetchErrorLike => {
  if (typeof e === 'object' && e !== null) return e as FetchErrorLike
  return {}
}

export const useRequests = () => {
  const requests = useState<ExpenseRequest[]>('requests', () => [])
  const loaded = useState<boolean>('requestsLoaded', () => false)

  const loading = useState<boolean>('requestsLoading', () => false)
  const error = useState<DomainError | null>('requestsError', () => null)

  const auth = useAuthMock()
  const currentRole = computed<Role>(() => auth.role?.value ?? 'applicant')

  const toDomainError = (e: unknown): DomainError => {
    const err = asFetchErrorLike(e)
    const status = err.statusCode ?? err.status

    if (status === 404) return notFound('Request not found')
    if (status === 403) return forbidden('Forbidden')
    if (status === 409) return conflict('Invalid status transition')

    return conflict(err.message ?? 'Unexpected error')
  }

  const fetchAll = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ExpenseRequest[]>('/api/requests')
      requests.value = data
      loaded.value = true
    } catch (e: unknown) {
      error.value = toDomainError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const ensureLoaded = async (): Promise<void> => {
    if (loaded.value) return
    await fetchAll()
  }

  const getAll = () => requests.value
  const getById = (id: string) => requests.value.find((r) => r.id === id)

  const createDraft = async (input: CreateDraftInput): Promise<ExpenseRequest> => {
    error.value = null
    try {
      const created = await $fetch<ExpenseRequest>('/api/requests', {
        method: 'POST',
        body: input,
      })
      requests.value = [created, ...requests.value]
      return created
    } catch (e: unknown) {
      error.value = toDomainError(e)
      throw e
    }
  }

  const updateStatus = async (id: string, next: RequestStatus): Promise<boolean> => {
    error.value = null
    const current = getById(id)
    if (!current) {
      error.value = notFound('Request not found')
      return false
    }

    try {
      const updated = await $fetch<ExpenseRequest>(`/api/requests/${id}`, {
        method: 'PATCH',
        body: {
          role: currentRole.value,
          nextStatus: next,
        },
      })

      requests.value = requests.value.map((r) => (r.id === id ? updated : r))
      return true
    } catch (e: unknown) {
      error.value = toDomainError(e)
      return false
    }
  }

  const updateDraft = async (id: string, input: UpdateDraftInput): Promise<boolean> => {
    error.value = null
    const current = getById(id)
    if (!current) {
      error.value = notFound('Request not found')
      return false
    }
    if (current.status !== 'draft') {
      error.value = conflict('Draft only')
      return false
    }

    try {
      const updated = await $fetch<ExpenseRequest>(`/api/requests/${id}`, {
        method: 'PATCH',
        body: {
          title: input.title,
          amountYen: input.amountYen,
        },
      })

      requests.value = requests.value.map((r) => (r.id === id ? updated : r))
      return true
    } catch (e: unknown) {
      error.value = toDomainError(e)
      return false
    }
  }

  const deleteDraft = async (id: string): Promise<boolean> => {
    error.value = null
    const current = getById(id)
    if (!current) {
      error.value = notFound('Request not found')
      return false
    }
    if (current.status !== 'draft') {
      error.value = conflict('Draft only')
      return false
    }

    try {
      await $fetch(`/api/requests/${id}?role=${currentRole.value}`, { method: 'DELETE' })
      requests.value = requests.value.filter((r) => r.id !== id)
      return true
    } catch (e: unknown) {
      error.value = toDomainError(e)
      return false
    }
  }

  return {
    requests,
    loading,
    error,
    fetchAll,
    ensureLoaded,
    getAll,
    getById,
    createDraft,
    updateStatus,
    updateDraft,
    deleteDraft,
  }
}
