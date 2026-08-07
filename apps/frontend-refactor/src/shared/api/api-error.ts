import i18n from '../i18n'

/** Normalised error thrown by the HTTP client for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(message: string, status: number, data: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * User-facing message for any thrown error. Prefers the backend's `message`
 * field (see error-handler.ts) and falls back to a localized generic message.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const serverMessage = (error.data as { message?: string } | null)?.message
    if (serverMessage) return serverMessage
  }
  return i18n.t('common.failedToReachSystem')
}
