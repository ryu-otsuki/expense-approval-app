<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { STATUS_LABEL, canEdit } from '~/domain/request'
import { useRequests } from '~/composables/useRequests'
import { useAuthMock } from '#imports'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { getById, updateDraft, ensureLoaded, error: reqError } = useRequests()
await ensureLoaded()

const { role } = useAuthMock()

const request = computed(() => getById(id.value))

const editable = computed(() => {
  if (!request.value) return false
  return canEdit(role.value, request.value.status)
})

const title = ref('')
const amountYen = ref<number>(0)

watchEffect(() => {
  if (!request.value) return
  title.value = request.value.title
  amountYen.value = request.value.amountYen
})

const error = ref<string>('')

const onSubmit = async () => {
  error.value = ''

  if (!request.value) {
    error.value = '申請が見つかりません'
    return
  }
  if (!editable.value) {
    error.value = 'この申請は編集できません（下書きのみ）'
    return
  }
  if (!title.value.trim()) {
    error.value = 'タイトルは必須です'
    return
  }
  if (!Number.isFinite(amountYen.value) || amountYen.value <= 0) {
    error.value = '金額は1円以上を入力してください'
    return
  }

  const ok = await updateDraft(request.value.id, {
    title: title.value.trim(),
    amountYen: amountYen.value,
  })

  if (!ok) {
    const type = reqError.value?.type

    if (type === 'NotFound') {
      error.value = '申請が見つかりません'
      return
    }
    if (type === 'Forbidden') {
      error.value = 'この操作を行う権限がありません'
      return
    }
    if (type === 'Conflict') {
      error.value = '下書き（draft）のみ編集できます'
      return
    }

    error.value = reqError.value?.message ?? '更新できませんでした'
    return
  }

  navigateTo(`/requests/${request.value.id}`)
}
</script>

<template>
  <div>
    <h2>申請編集</h2>

    <p style="margin: 8px 0">
      <NuxtLink :to="`/requests/${id}`">← 詳細へ戻る</NuxtLink>
    </p>

    <div v-if="!request" style="opacity: 0.8">見つかりません（id: {{ id }}）</div>

    <div v-else>
      <p style="opacity: 0.8">現在の状態: {{ STATUS_LABEL[request.status] }}</p>

      <div v-if="!editable" style="margin-top: 12px; opacity: 0.8">
        下書き（draft）のみ編集できます。
      </div>

      <form v-else style="margin-top: 12px" @submit.prevent="onSubmit">
        <div style="margin-bottom: 8px">
          <label>タイトル</label><br />
          <input v-model="title" type="text" style="width: 320px" />
        </div>

        <div style="margin-bottom: 8px">
          <label>金額</label><br />
          <input v-model.number="amountYen" type="number" min="1" style="width: 160px" />
        </div>

        <p v-if="error" style="color: #d33">{{ error }}</p>

        <button type="submit">保存</button>
      </form>
    </div>
  </div>
</template>
