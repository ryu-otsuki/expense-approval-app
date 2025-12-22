import type { ExpenseRequest, RequestStatus } from '~/domain/request'

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
  const error = useState<string | null>('requestsError', () => null)

  const fetchAll = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ExpenseRequest[]>('/api/requests')
      requests.value = data
      loaded.value = true
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to fetch requests'
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

  const getById = (id: string) => requests.value.find(r => r.id === id)

  // POST /api/requests（draft作成）
  const createDraft = async (input: CreateDraftInput): Promise<ExpenseRequest> => {
    error.value = null
    const created = await $fetch<ExpenseRequest>('/api/requests', {
      method: 'POST',
      body: input,
    })

    // 追加を反映（APIが返したものを信じる）
    requests.value = [created, ...requests.value]
    return created
  }

  // PATCH /api/requests/:id（status更新）
  const updateStatus = async (id: string, next: RequestStatus): Promise<boolean> => {
    error.value = null
    const current = getById(id)
    if (!current) return false

    const updated = await $fetch<ExpenseRequest>(`/api/requests/${id}`, {
      method: 'PATCH',
      body: { status: next },
    })

    // 配列を差し替えてリアクティブに反映
    requests.value = requests.value.map(r => (r.id === id ? updated : r))
    return true
  }

  // PATCH /api/requests/:id（draftの内容更新）
  // ※「draftのみ編集可」は UI じゃなく composable 側で守る方針
  const updateDraft = async (id: string, input: UpdateDraftInput): Promise<boolean> => {
    error.value = null
    const current = getById(id)
    if (!current) return false
    if (current.status !== 'draft') return false

    const updated = await $fetch<ExpenseRequest>(`/api/requests/${id}`, {
      method: 'PATCH',
      body: {
        title: input.title,
        amountYen: input.amountYen,
      },
    })

    requests.value = requests.value.map(r => (r.id === id ? updated : r))
    return true
  }

  // DELETE /api/requests/:id（draftのみ削除）
  const deleteDraft = async (id: string): Promise<boolean> => {
    error.value = null
    const current = getById(id)
    if (!current) return false
    if (current.status !== 'draft') return false

    await $fetch(`/api/requests/${id}`, { method: 'DELETE' })
    requests.value = requests.value.filter(r => r.id !== id)
    return true
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