<script setup lang="ts">
import { useRequests } from '~/composables/useRequests'

const router = useRouter()
const { createDraft } = useRequests()

const title = ref('')
const amountYen = ref<number | null>(null)
const error = ref('')

const onSubmit = () => {
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

  const created = createDraft({ title: t, amountYen: a })

  // 作成後は一覧へ（もしくは詳細へでもOK）
  router.push('/requests')
}
</script>

<template>
  <div>
    <h2>申請作成</h2>

    <p style="margin: 8px 0;">
      <NuxtLink to="/requests">← 一覧へ戻る</NuxtLink>
    </p>

    <form @submit.prevent="onSubmit" style="display: grid; gap: 12px; max-width: 420px;">
      <label style="display: grid; gap: 6px;">
        <span>タイトル</span>
        <input v-model="title" type="text" placeholder="例: 書籍購入（業務改善）" />
      </label>

      <label style="display: grid; gap: 6px;">
        <span>金額（円）</span>
        <input v-model.number="amountYen" type="number" min="1" step="1" placeholder="例: 3200" />
      </label>

      <p v-if="error" style="margin: 0; color: #d33;">
        {{ error }}
      </p>

      <button type="submit">
        下書き（draft）として作成
      </button>
    </form>
  </div>
</template>
