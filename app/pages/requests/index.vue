<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRequests } from '~/composables/useRequests'
import {
  STATUS_LABEL,
  STATUS_TRANSITIONS,
  type Role,
  type RequestStatus,
} from '~/domain/request'

// ロール切り替え（MVPなのでセレクトで切替）
const currentRole = ref<Role>('applicant')

// 申請データは composable から取得（UIはmockを直接触らない）
const { getAll, updateStatus } = useRequests()
const requests = computed(() => getAll())

// 「このロール・この状態」から遷移できる次の状態一覧を返す
const getNextStatuses = (status: RequestStatus): readonly RequestStatus[] => {
  return STATUS_TRANSITIONS[currentRole.value][status]
}

// 状態更新（今はモック：配列内のデータを書き換えるだけ）
const onClickTransition = (requestId: string, next: RequestStatus) => {
  const ok = updateStatus(requestId, next)
  if (!ok) {
    alert(`対象の申請が見つかりませんでした（id=${requestId}）`)
  }
}
</script>

<template>
  <div>
    <h2>申請一覧</h2>

    <!-- ナビ（パンくずではなく単純な導線） -->
    <nav style="display: flex; gap: 12px; margin: 8px 0;">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/requests/new">+ 新規作成</NuxtLink>
    </nav>

    <!-- ロール切り替え（MVP用） -->
    <div style="margin: 12px 0;">
      <label>
        ロール：
        <select v-model="currentRole">
          <option value="applicant">申請者</option>
          <option value="approver">承認者</option>
        </select>
      </label>
    </div>

    <ul style="padding-left: 16px;">
      <li
        v-for="r in requests"
        :key="r.id"
        style="margin-bottom: 16px;"
      >
        <!-- タイトルは詳細へ -->
        <div>
          <strong>
            <NuxtLink :to="`/requests/${r.id}`">{{ r.title }}</NuxtLink>
          </strong>
        </div>

        <div>金額: {{ r.amountYen.toLocaleString() }} 円</div>
        <div>状態: {{ STATUS_LABEL[r.status] }}</div>
        <div>作成日: {{ r.createdAt }}</div>

        <!-- この申請で“できる操作” -->
        <div style="margin-top: 8px;">
          <template v-if="getNextStatuses(r.status).length">
            <button
              v-for="next in getNextStatuses(r.status)"
              :key="next"
              style="margin-right: 8px;"
              @click="onClickTransition(r.id, next)"
            >
              {{ STATUS_LABEL[next] }} にする
            </button>
          </template>
          <span v-else style="opacity: 0.7;">操作なし</span>
        </div>
      </li>
    </ul>
  </div>
</template>
