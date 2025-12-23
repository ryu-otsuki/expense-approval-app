import type { ExpenseRequest, RequestStatus, Role } from '~/domain/request'
import type { DomainError } from '~/domain/error'
import { notFound, forbidden, conflict } from '~/domain/error'
import { useAuthMock } from '~/composables/useAuthMock' // ここはあなたの実装に合わせてパス調整

type CreateDraftInput = {
  title: string
  amountYen: number
}

type UpdateDraftInput = {
  title: string
  amountYen: number
}

export const useRequests = () => {
  // 共有状態（UIはここだけ見ればOK）
  const requests = useState<ExpenseRequest[]>('requests', () => [])
  const loaded = useState<boolean>('requestsLoaded', () => false)

  const loading = useState<boolean>('requestsLoading', () => false)
  const error = useState<DomainError | null>('requestsError', () => null)

  // role（モック認証）
  // 前提（推測）：useAuthMock が role: Ref<Role> を持つ
  const auth = useAuthMock()
  const currentRole = computed<Role>(() => auth.role?.value ?? 'applicant')

  const toDomainError = (e: any): DomainError => {
    const status = e?.statusCode ?? e?.status
    if (status === 404) return notFound('Request not found')
    if (status === 403) return forbidden('Forbidden')
    if (status === 409) return conflict('Invalid status transition')
    return conflict(e?.message ?? 'Unexpected error')
  }

  const fetchAll = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ExpenseRequest[]>('/api/requests')
      requests.value = data
      loaded.value = true
    } catch (e: any) {
      error.value = toDomainError(e)
      // loaded は立てない（再試行できるように）
      throw e
    } finally {
      loading.value = false
    }
  }

  // UIをほぼ触らないための「初回ロード保証」
  const ensureLoaded = async (): Promise<void> => {
    if (loaded.value) return
    await fetchAll()
  }

  // UI互換：同期で使える getter
  const getAll = () => requests.value
  const getById = (id: string) => requests.value.find((r) => r.id === id)

  // POST /api/requests（draft作成）
  const createDraft = async (input: CreateDraftInput): Promise<ExpenseRequest> => {
    error.value = null
    try {
      const created = await $fetch<ExpenseRequest>('/api/requests', {
        method: 'POST',
        body: input,
      })
      // 追加を反映（APIが返したものを信じる）
      requests.value = [created, ...requests.value]
      return created
    } catch (e: any) {
      error.value = toDomainError(e)
      throw e
    }
  }

  // PATCH /api/requests/:id（status更新）
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

      // 配列を差し替えてリアクティブに反映
      requests.value = requests.value.map((r) => (r.id === id ? updated : r))
      return true
    } catch (e: any) {
      error.value = toDomainError(e)
      return false
    }
  }

  // PATCH /api/requests/:id（draftの内容更新）
  // ※「draftのみ編集可」は UI じゃなく composable 側で守る方針（現状維持）
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
    } catch (e: any) {
      error.value = toDomainError(e)
      return false
    }
  }

  // DELETE /api/requests/:id（draftのみ削除）
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
    } catch (e: any) {
      error.value = toDomainError(e)
      return false
    }
  }

  return {
    // state
    requests,
    loading,
    error,

    // load
    fetchAll,
    ensureLoaded,

    // getters
    getAll,
    getById,

    // commands
    createDraft,
    updateStatus,
    updateDraft,
    deleteDraft,
  }
}
