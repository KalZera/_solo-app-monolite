import { env } from '../config/env'
import { clearToken, getToken, setToken } from '../storage/token-storage'
import { ApiError } from './api-error'

const baseURL = env.apiUrl

// ─── Forced-logout bridge ────────────────────────────────────────────────────
// The session store registers a handler so the client can drop the session when
// a refresh ultimately fails. Kept as a callback to avoid a circular import.
type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  headers?: Record<string, string>
  query?: Record<string, QueryValue>
  signal?: AbortSignal
  /**
   * Skip the 401 refresh-and-retry and the forced-logout bridge. Used by the
   * identity endpoints (login/register/refresh/logout), which manage auth
   * themselves — this prevents a failed logout/refresh from recursing.
   */
  skipAuthRefresh?: boolean
  /** Internal: prevents the 401 refresh-and-retry from recursing. */
  _retry?: boolean
}

interface FullRequestOptions extends RequestOptions {
  method: string
  body?: unknown
}

// ─── Single-flight refresh ───────────────────────────────────────────────────
// Concurrent 401s share one refresh call. The refresh token lives in an httpOnly
// cookie, so `credentials: 'include'` is required.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${baseURL}/identity/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new ApiError('Refresh failed', response.status)
        const data = (await response.json()) as { access_token: string }
        await setToken(data.access_token)
        return data.access_token
      })
      .catch(async () => {
        await clearToken()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return `${baseURL}${path}`
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) search.append(key, String(value))
  }
  const qs = search.toString()
  return qs ? `${baseURL}${path}?${qs}` : `${baseURL}${path}`
}

async function toApiError(response: Response): Promise<ApiError> {
  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    // Non-JSON error body — keep data null and use a generic message.
  }
  const message =
    (data as { message?: string } | null)?.message ??
    `Request failed with status ${response.status}`
  return new ApiError(message, response.status, data)
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

async function request<T>(path: string, options: FullRequestOptions): Promise<T> {
  const { method, body, headers = {}, query, signal, skipAuthRefresh, _retry } = options

  const token = await getToken()
  const finalHeaders: Record<string, string> = { ...headers }
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  let payload: BodyInit | undefined
  if (body !== undefined && body !== null) {
    if (isFormData(body)) {
      payload = body // Let fetch set the multipart boundary itself.
    } else {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] ?? 'application/json'
      payload = JSON.stringify(body)
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers: finalHeaders,
    body: payload,
    signal,
  })

  const isRefreshCall = path.includes('/identity/refresh')
  if (response.status === 401 && !skipAuthRefresh && !isRefreshCall && !_retry) {
    const newToken = await refreshAccessToken()
    if (!newToken) {
      onUnauthorized?.()
      throw await toApiError(response)
    }
    return request<T>(path, { ...options, _retry: true })
  }

  if (!response.ok) {
    if (response.status === 401 && !skipAuthRefresh) onUnauthorized?.()
    throw await toApiError(response)
  }

  return parseBody<T>(response)
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
