<script setup lang="ts">
import { computed } from 'vue'
import { useRequests } from '~/composables/useRequests'
import { useAuthMock } from '#imports'
import { STATUS_LABEL, STATUS_TRANSITIONS, type RequestStatus } from '~/domain/request'

const { getAll, updateStatus, ensureLoaded, error } = useRequests()
await ensureLoaded()

const { role } = useAuthMock()

const requests = computed(() => getAll())

const getNextStatuses = (status: RequestStatus): readonly RequestStatus[] => {
  return STATUS_TRANSITIONS[role.value][status]
}

const onClickTransition = async (requestId: string, next: RequestStatus) => {
  const ok = await updateStatus(requestId, next)

  if (ok) return

  // #27: NotFound / Forbidden / Conflict を区別して扱う
  const type = error.value?.type

  if (type === 'NotFound') {
    alert(`対象の申請が見つかりませんでした (id=${requestId})`)
    return
  }
  if (type === 'Forbidden') {
    alert('この操作を行う権限がありません')
    return
  }
  if (type === 'Conflict') {
    alert('ルール上この操作はできません（状態遷移が不正です）')
    return
  }

  // 想定外
  alert(error.value?.message ?? 'エラーが発生しました')
}
</script>

<template>
  <div>
    <h2>申請一覧</h2>

    <p style="margin: 8px 0">
      <NuxtLink to="/requests/new">+ 新規作成</NuxtLink>
    </p>

    <div v-for="r in requests" :key="r.id" style="margin: 18px 0">
      <div>
        <NuxtLink :to="`/requests/${r.id}`">
          <strong>{{ r.title }}</strong>
        </NuxtLink>
      </div>

      <div>金額: {{ r.amountYen.toLocaleString() }} 円</div>
      <div>状態: {{ STATUS_LABEL[r.status] }}</div>
      <div>作成日: {{ r.createdAt }}</div>

      <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap">
        <button
          v-for="next in getNextStatuses(r.status)"
          :key="next"
          type="button"
          @click="onClickTransition(r.id, next)"
        >
          {{ STATUS_LABEL[next] }} にする
        </button>
      </div>
    </div>
  </div>
</template>
