<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '#imports'
import { STATUS_LABEL, canEdit, canDelete } from '~/domain/request'
import { useRequests } from '~/composables/useRequests'

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))
const { getById, deleteById } = useRequests()

const request = computed(() => getById(id.value))

const canShowEdit = computed(() =>
  request.value ? canEdit(request.value.status) : false
)
const canShowDelete = computed(() =>
  request.value ? canDelete(request.value.status) : false
)

const onClickDelete = async () => {
  if (!request.value) return
  const ok = confirm('この申請を削除しますか？（下書きのみ削除可能）')
  if (!ok) return

  const deleted = deleteById(request.value.id)
  if (!deleted) {
    alert('削除できませんでした')
    return
  }
  await router.push('/requests')
}
</script>

<template>
  <div>
    <h2>申請詳細</h2>

    <p style="margin: 8px 0;">
      <NuxtLink to="/requests">← 一覧へ戻る</NuxtLink>
    </p>

    <div v-if="request">
      <div style="margin-top: 12px;">
        <div><strong>{{ request.title }}</strong></div>
        <div>金額: {{ request.amountYen.toLocaleString() }} 円</div>
        <div>状態: {{ STATUS_LABEL[request.status] }}</div>
        <div>作成日: {{ request.createdAt }}</div>
      </div>

      <!-- 操作エリア -->
      <div
        style="
          margin-top: 16px;
          display: flex;
          gap: 12px;
          align-items: center;
        "
      >
        <!-- 主操作：編集 -->
        <NuxtLink
          v-if="canShowEdit"
          :to="`/requests/${id}/edit`"
          style="text-decoration: underline;"
        >
          編集する
        </NuxtLink>

        <!-- 破壊操作：削除（控えめ） -->
        <button
          v-if="canShowDelete"
          @click="onClickDelete"
          style="
            color: #b00020;
            background: transparent;
            border: none;
            cursor: pointer;
          "
        >
          削除する
        </button>

        <!-- 操作不可の理由表示 -->
        <span
          v-if="!canShowEdit && !canShowDelete"
          style="opacity: 0.7;"
        >
          ※ 下書き以外は編集・削除できません
        </span>
      </div>
    </div>

    <div v-else style="margin-top: 12px; opacity: 0.8;">
      <p>この申請は見つかりません（id: {{ id }}）</p>
      <p>URLが正しいか確認してください。</p>
    </div>
  </div>
</template>