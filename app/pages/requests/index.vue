<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockRequests } from '~/mocks/requests'
import {
  type Role,
  type RequestStatus,
  type ExpenseRequest,
  STATUS_LABEL,
  STATUS_TRANSITIONS,
} from '~/domain/request'

// 画面表示用の状態（モック）
// ※ mockRequests をそのまま使うと「更新できない固定データ」になりがちなので、ref に入れる
const requests = ref<ExpenseRequest[]>([...mockRequests])

// ロール切り替え（モック）
const currentRole = ref<Role>('applicant')

// UI で選べるようにしてる場合はこれを使う（任意）
const roleLabel: Record<Role, string> = {
  applicant: '申請者',
  approver: '承認者',
}

// 次に遷移できるステータス一覧（ドメイン定義に従う）
const getNextStatuses = (status: RequestStatus): readonly RequestStatus[] => {
  return STATUS_TRANSITIONS[currentRole.value][status]
}

// クリックで「実際に status を更新」する（モック）
const onClickTransition = (requestId: string, next: RequestStatus) => {
  const target = requests.value.find((r) => r.id === requestId)
  if (!target) return

  // 不正遷移ガード（UI的にはボタンが出ない想定だが、念のため）
  const allowed = getNextStatuses(target.status)
  if (!allowed.includes(next)) {
    alert('不正な状態遷移です（モック）')
    return
  }

  target.status = next
}
</script>

<template>
  <div>
    <h2>申請一覧</h2>

    <!-- ロール切り替え（モック） -->
    <div style="margin: 12px 0;">
      <label style="margin-right: 8px;">ロール:</label>
      <select v-model="currentRole">
        <option value="applicant">{{ roleLabel.applicant }}</option>
        <option value="approver">{{ roleLabel.approver }}</option>
      </select>
    </div>

    <ul style="padding-left: 16px;">
      <li
        v-for="r in requests"
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
