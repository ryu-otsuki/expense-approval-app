<script setup lang="ts">
import { mockRequests } from '~/mocks/requests'
import type { Role, RequestStatus } from '~/domain/request'
import { STATUS_LABEL, STATUS_TRANSITIONS } from '~/domain/request'

const currentRole = ref<Role>('applicant')

/**
 * このstatusから、今のロールで遷移できる「次のstatus一覧」を返す
 * UIはここを通して "何ができるか" を決める
 */
const getNextStatuses = (status: RequestStatus): readonly RequestStatus[] => {
  return STATUS_TRANSITIONS[currentRole.value][status]
}

// 今はモックなので処理はしない。挙動確認用。
const onClickTransition = (requestId: string, next: RequestStatus) => {
  alert(`request=${requestId} を「${STATUS_LABEL[next]}」に変更（モック）`)
}
</script>

<template>
  <div>
    <h2>申請一覧</h2>

    <!-- ロール切替（モック） -->
    <div style="margin: 12px 0;">
      <label style="margin-right: 8px;">ロール:</label>
      <select v-model="currentRole">
        <option value="applicant">申請者</option>
        <option value="approver">承認者</option>
      </select>
    </div>

    <ul style="padding-left: 16px;">
      <li
        v-for="r in mockRequests"
        :key="r.id"
        style="margin-bottom: 16px;"
      >
        <div><strong>{{ r.title }}</strong></div>
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
