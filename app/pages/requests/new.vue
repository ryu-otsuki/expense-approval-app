<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRequests } from '~/composables/useRequests'

const router = useRouter()
const { createDraft, error: reqError } = useRequests()

const title = ref('')
const amountYen = ref<number | null>(null)
const error = ref('')

const onSubmit = async () => {
  error.value = ''

  const t = title.value.trim()
  const a = amountYen.value

  // 最低限バリデーション
  if (!t) {
    error.value = 'タイトルを入力してください'
    return
  }
  if (a === null || Number.isNaN(a) || a <= 0) {
    error.value = '金額は1円以上で入力してください'
    return
  }

  try {
    await createDraft({ title: t, amountYen: a })
    // 作成後は一覧へ（詳細へ飛ばしたいなら createDraft の戻り値を使う）
    router.push('/requests')
  } catch {
    const type = reqError.value?.type
    if (type === 'Forbidden') {
      error.value = 'この操作を行う権限がありません'
      return
    }
    // NotFound/Conflict は通常ここでは起きにくいが、一応拾う
    error.value = reqError.value?.message ?? '作成に失敗しました'
  }
}
</script>

<template>
  <div>
    <h2>申請作成</h2>

    <p style="margin: 8px 0">
      <NuxtLink to="/requests">← 一覧へ戻る</NuxtLink>
    </p>

    <form @submit.prevent="onSubmit" style="display: grid; gap: 12px; max-width: 420px">
      <label style="display: grid; gap: 6px">
        <span>タイトル</span>
        <input v-model="title" type="text" placeholder="例: 書籍購入（業務改善）" />
      </label>

      <label style="display: grid; gap: 6px">
        <span>金額（円）</span>
        <input v-model.number="amountYen" type="number" min="1" step="1" placeholder="例: 3200" />
      </label>

      <p v-if="error" style="margin: 0; color: #d33">
        {{ error }}
      </p>

      <button type="submit">下書き（draft）として作成</button>
    </form>
  </div>
</template>
