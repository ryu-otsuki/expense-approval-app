<script setup lang="ts">
import { STATUS_LABEL, type RequestStatus, type Role } from '~/domain/request'
import { useRequests } from '~/composables/useRequests'

const currentRole = ref<Role>('applicant')

const { requests, updateStatus, getNextStatuses } = useRequests()

const nextStatuses = (status: RequestStatus): readonly RequestStatus[] => {
  return getNextStatuses(currentRole.value, status)
}

// 今はモックなので alert + UI上の status 更新まで行う（APIは未接続）
const onClickTransition = (requestId: string, next: RequestStatus) => {
  updateStatus(requestId, next)
  alert(`request=${requestId} を「${STATUS_LABEL[next]}」に変更（モック）`)
}
</script>

<template>
  <div>
    <h2>申請一覧</h2>

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
        <div>
          <strong>
            <!-- 一覧→詳細への導線 -->
            <NuxtLink :to="`/requests/${r.id}`">
              {{ r.title }}
            </NuxtLink>
          </strong>
        </div>

        <div>金額: {{ r.amountYen.toLocaleString() }} 円</div>
        <div>状態: {{ STATUS_LABEL[r.status] }}</div>
        <div>作成日: {{ r.createdAt }}</div>

        <!-- この申請で“できる操作” -->
        <div style="margin-top: 8px;">
          <template v-if="nextStatuses(r.status).length">
            <button
              v-for="next in nextStatuses(r.status)"
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
