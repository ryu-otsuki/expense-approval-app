export type DomainErrorType = 'NotFound' | 'Forbidden' | 'Conflict'

export type DomainError = {
  type: DomainErrorType
  message: string
  detail?: string
}

export const notFound = (message = 'Not found', detail?: string): DomainError => ({
  type: 'NotFound',
  message,
  detail,
})

export const forbidden = (message = 'Forbidden', detail?: string): DomainError => ({
  type: 'Forbidden',
  message,
  detail,
})

export const conflict = (message = 'Conflict', detail?: string): DomainError => ({
  type: 'Conflict',
  message,
  detail,
})
