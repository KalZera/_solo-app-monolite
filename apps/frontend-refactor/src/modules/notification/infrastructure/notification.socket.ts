import { env } from '@/shared/config/env'

// http(s):// -> ws(s)://, keeping host/port/path as-is.
function toWebSocketUrl(apiUrl: string): string {
  return apiUrl.replace(/^http/, 'ws')
}

// The browser/RN WebSocket API can't set custom headers, so the access token travels as a
// query param — mirrors how notification-websocket-routes.ts reads it on the backend.
export function buildNotificationSocketUrl(token: string): string {
  return `${toWebSocketUrl(env.apiUrl)}/notifications/ws?token=${encodeURIComponent(token)}`
}
