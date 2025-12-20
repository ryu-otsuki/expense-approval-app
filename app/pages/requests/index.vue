<script setup lang="ts">
import { mockRequests } from '~/mocks/requests'
import type { RequestStatus } from '~/domain/request'

const statusLabel: Record<RequestStatus, string> = {
  draft: '下書き',
  submitted: '申請中',
  approved: '承認済み',
  rejected: '却下',
}
</script>

<template>
  <div>
    <h2>申請一覧</h2>

    <ul style="padding-left: 16px;">
      <li v-for="r in mockRequests" :key="r.id" style="margin-bottom: 8px;">
        <div><strong>{{ r.title }}</strong></div>
        <div>金額: {{ r.amount.toLocaleString() }} 円</div>
        <div>状態: {{ statusLabel[r.status] }}</div>
        <div>作成日: {{ r.createdAt }}</div>
      </li>
    </ul>
  </div>
</template>
