<script setup lang="ts">
import { canEdit, STATUS_LABEL } from '~/domain/request'
import { useRequests } from '~/composables/useRequests'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { getById, updateDraft } = useRequests()

const request = computed(() => getById(id.value))

// フォーム状態（初期値は request から入れる）
const title = ref('')
const amountYen = ref<number>(0)
const errorMessage = ref('')

// request が取れたらフォームに反映
watchEffect(() => {
  if (!request.value) return
  title.value = request.value.title
  amountYen.value = request.value.amountYen
})

// 編集できるか（draftのみ）
const editable = computed(() => {
  if (!request.value) return false
  return canEdit(request.value.status)
})

const onSubmit = async () => {
  errorMessage.value = ''

  if (!request.value) {
    errorMessage.value = '申請が見つかりません'
    return
  }
  if (!editable.value) {
    errorMessage.value = `現在の状態（${STATUS_LABEL[request.value.status]}）では編集できません`
    return
  }

  // 最低限バリデーション
  if (!title.value.trim()) {
    errorMessage.value = 'タイトルを入力してください'
    return
  }
  if (!Number.isFinite(amountYen.value) || amountYen.value <= 0) {
    errorMessage.value = '金額は1円以上で入力してください'
    return
  }

  const ok = updateDraft(id.value, { title: title.value.trim(), amountYen: amountYen.value })
  if (!ok) {
    errorMessage.value = '保存に失敗しました（下書き以外は編集できません）'
    return
  }

  // 保存後は詳細へ戻す
  await navigateTo(`/requests/${id.value}`)
}
</script>

<template>
  <div>
    <h2>申請編集</h2>

    <p style="margin: 8px 0;">
      <NuxtLink :to="`/requests/${id}`">← 詳細へ戻る</NuxtLink>
    </p>

    <div v-if="!request" style="margin-top: 12px; opacity: 0.8;">
      <p>この申請は見つかりません（id: {{ id }}）</p>
    </div>

    <div v-else>
      <p style="margin-top: 8px;">
        現在の状態: {{ STATUS_LABEL[request.status] }}
      </p>

      <div v-if="!editable" style="margin-top: 12px; opacity: 0.8;">
        <p>下書き以外は編集できません。</p>
      </div>

      <form v-else @submit.prevent="onSubmit" style="margin-top: 12px;">
        <div style="margin: 8px 0;">
          <label style="display:block; font-weight:600;">タイトル</label>
          <input v-model="title" type="text" style="width: 320px;" />
        </div>

        <div style="margin: 8px 0;">
          <label style="display:block; font-weight:600;">金額（円）</label>
          <input v-model.number="amountYen" type="number" min="1" style="width: 160px;" />
        </div>

        <p v-if="errorMessage" style="color: #d33; margin: 8px 0;">
          {{ errorMessage }}
        </p>

        <button type="submit">保存</button>
      </form>
    </div>
  </div>
</template>