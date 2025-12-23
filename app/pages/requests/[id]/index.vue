<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { STATUS_LABEL } from '~/domain/request'
import { useRequests } from '~/composables/useRequests'
import { useAuthMock } from '#imports'
import { requestService } from '~/domain/services/requestService'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { getById, deleteDraft, ensureLoaded, error } = useRequests()
await ensureLoaded()

const { role } = useAuthMock()

const request = computed(() => getById(id.value))

const canShowEdit = computed(() => {
  if (!request.value) return false
  return requestService.canEdit(role.value, request.value.status)
})

const canShowDelete = computed(() => {
  if (!request.value) return false
  return requestService.canDelete(role.value, request.value.status)
})

const onDelete = async () => {
  if (!request.value) return

  const okConfirm = confirm('この申請を削除しますか？（下書きのみ削除可能）')
  if (!okConfirm) return

  const ok = await deleteDraft(request.value.id)

  if (!ok) {
    const type = error.value?.type

    if (type === 'NotFound') {
      alert('対象の申請が見つかりませんでした')
      return
    }
    if (type === 'Forbidden') {
      alert('この操作を行う権限がありません')
      return
    }
    if (type === 'Conflict') {
      alert('下書き以外は削除できません')
      return
    }

    alert(error.value?.message ?? '削除できませんでした')
    return
  }

  navigateTo('/requests')
}
</script>

<template>
  <div>
    <h2>申請詳細</h2>

    <p style="margin: 8px 0">
      <NuxtLink to="/requests">← 一覧へ戻る</NuxtLink>
    </p>

    <div v-if="request">
      <div style="margin-top: 12px">
        <div>
          <strong>{{ request.title }}</strong>
        </div>
        <div>金額: {{ request.amountYen.toLocaleString() }} 円</div>
        <div>状態: {{ STATUS_LABEL[request.status] }}</div>
        <div>作成日: {{ request.createdAt }}</div>
      </div>

      <div style="margin-top: 12px; display: flex; gap: 8px">
        <NuxtLink v-if="canShowEdit" :to="`/requests/${request.id}/edit`"> 編集する </NuxtLink>

        <button v-if="canShowDelete" type="button" @click="onDelete">削除する</button>
      </div>

      <p v-if="!canShowEdit && request.status === 'draft'" style="opacity: 0.8; margin-top: 8px">
        ※ 現在のRoleでは編集できません
      </p>
    </div>

    <div v-else style="margin-top: 12px; opacity: 0.8">
      <p>この申請は見つかりません（id: {{ id }}）</p>
      <p style="opacity: 0.8">URLが正しいか確認してください。</p>
    </div>
  </div>
</template>
