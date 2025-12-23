import type { Role } from '~/domain/request'

export const useAuthMock = () => {
  const role = useState<Role>('role', () => 'applicant')

  const isApplicant = computed(() => role.value === 'applicant')
  const isApprover = computed(() => role.value === 'approver')

  const setRole = (next: Role) => {
    role.value = next
  }

  return {
    role,
    isApplicant,
    isApprover,
    setRole,
  }
}
