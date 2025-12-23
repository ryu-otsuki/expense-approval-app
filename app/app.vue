<script setup lang="ts">
import { useAuthMock } from '#imports'
import type { Role } from '~/domain/request'

const { role, setRole } = useAuthMock()

const onChangeRole = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value as Role
  setRole(value)
}
</script>

<template>
  <div>
    <header style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px">
      <div style="font-weight: 700">経費申請アプリ</div>

      <nav style="display: flex; gap: 12px">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/requests">申請一覧</NuxtLink>
        <NuxtLink to="/requests/new">新規作成</NuxtLink>
      </nav>

      <div style="margin-left: auto; display: flex; align-items: center; gap: 8px">
        <label style="font-size: 12px; opacity: 0.8">Role</label>
        <select :value="role" @change="onChangeRole">
          <option value="applicant">申請者</option>
          <option value="approver">承認者</option>
        </select>
      </div>
    </header>

    <NuxtPage />
  </div>
</template>
