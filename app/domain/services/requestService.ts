import type { Role, RequestStatus } from '~/domain/request'
import { STATUS_TRANSITIONS } from '~/domain/request'

export const requestService = {
  getAvailableTransitions(role: Role, status: RequestStatus): readonly RequestStatus[] {
    return STATUS_TRANSITIONS[role][status]
  },

  canTransition(role: Role, fromStatus: RequestStatus, toStatus: RequestStatus): boolean {
    return this.getAvailableTransitions(role, fromStatus).includes(toStatus)
  },

  canEdit(role: Role, status: RequestStatus): boolean {
    return role === 'applicant' && status === 'draft'
  },

  canDelete(role: Role, status: RequestStatus): boolean {
    return role === 'applicant' && status === 'draft'
  },
} as const
