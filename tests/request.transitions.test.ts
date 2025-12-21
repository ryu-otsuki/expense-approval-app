import { describe, it, expect } from 'vitest'
import { STATUS_TRANSITIONS } from '../app/domain/request'
import type { Role, RequestStatus } from '../app/domain/request'

describe('STATUS_TRANSITIONS (domain)', () => {
  it('applicant: draft -> submitted が可能', () => {
    const role: Role = 'applicant'
    const status: RequestStatus = 'draft'
    expect(STATUS_TRANSITIONS[role][status]).toEqual(['submitted'])
  })

  it('approver: submitted -> approved / rejected が可能', () => {
    const role: Role = 'approver'
    const status: RequestStatus = 'submitted'
    expect(STATUS_TRANSITIONS[role][status]).toEqual(['approved', 'rejected'])
  })

  it('applicant: submitted -> approved は不可能（nextが空）', () => {
    const role: Role = 'applicant'
    const status: RequestStatus = 'submitted'
    expect(STATUS_TRANSITIONS[role][status]).toEqual([])
  })

  it('draft状態のapproverは操作不可（nextが空）', () => {
    const role: Role = 'approver'
    const status: RequestStatus = 'draft'
    expect(STATUS_TRANSITIONS[role][status]).toEqual([])
  })
})
