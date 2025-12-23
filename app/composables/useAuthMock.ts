import type { Role } from '~/domain/request'

export const useAuthMock = () => {
  // Nuxt推奨: useState でアプリ全体の共有状態にする
  const role = useState<Role>('role', () => 'applicant')

  const setRole = (next: Role) => {
    role.value = next
  }

  const isApplicant = computed(() => role.value === 'applicant')
  const isApprover = computed(() => role.value === 'approver')

  return {
    role,
    setRole,
    isApplicant,
    isApprover,
  }
}
