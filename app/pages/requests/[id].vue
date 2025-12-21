<script setup lang="ts">
import { STATUS_LABEL } from '~/domain/request'
import { useRequests } from '~/composables/useRequests'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { getById } = useRequests()

const request = computed(() => getById(id.value))
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
    </div>

    <div v-else style="margin-top: 12px; opacity: 0.8;">
      <p>この申請は見つかりません（id: {{ id }}）</p>
      <p style="opacity: 0.8;">URLが正しいか確認してください。</p>
    </div>
  </div>
</template>
