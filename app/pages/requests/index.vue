<script setup lang="ts">
import { STATUS_LABEL, STATUS_TRANSITIONS, type RequestStatus, type Role } from '~/domain/request'
import { useRequests } from '~/composables/useRequests'

const { requests, updateStatus } = useRequests()

const currentRole = ref<Role>('applicant')

const getNextStatuses = (status: RequestStatus): readonly RequestStatus[] => {
  return STATUS_TRANSITIONS[currentRole.value][status]
}

// 今回はモックなのでAPI通信はしない。状態だけ更新する。
const onClickTransition = (requestId: string, next: RequestStatus) => {
  updateStatus(requestId, next, currentRole.value)
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
      <li v-for="r in requests" :key="r.id" style="margin-bottom: 16px;">
        <div><strong>{{ r.title }}</strong></div>
        <div>金額: {{ r.amountYen.toLocaleString() }} 円</div>
        <div>状態: {{ STATUS_LABEL[r.status] }}</div>
        <div>作成日: {{ r.createdAt }}</div>

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
