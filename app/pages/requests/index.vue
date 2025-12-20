<!-- app/pages/requests/index.vue -->
<script setup lang="ts">
import { mockRequests } from '~/mocks/requests'
import { STATUS_LABEL } from '~/domain/request'
</script>

<template>
  <div>
    <h2>申請一覧</h2>

    <ul style="padding-left: 16px;">
      <li v-for="r in mockRequests" :key="r.id" style="margin-bottom: 16px;">
        <div><strong>{{ r.title }}</strong></div>
        <div>金額: {{ r.amountYen.toLocaleString() }} 円</div>
        <div>状態: {{ STATUS_LABEL[r.status] }}</div>
        <div>作成日: {{ r.createdAt }}</div>
      </li>
    </ul>
  </div>
</template>
