import type { WebSocket } from 'ws'
import type { ID } from '../../../../shared/types/index'
import type { Notification } from '../../domain/notification'

// Tracks live WebSocket connections per user (a hunter can have several — one per open tab
// or device) and pushes notifications to whichever ones are currently connected. Purely
// in-memory: a restart drops every connection, which is fine — the client reconnects and
// nothing is lost since notifications are still persisted via NotificationRepository.
export class NotificationSocketHub {
  private sockets = new Map<ID, Set<WebSocket>>()

  register (userId: ID, socket: WebSocket): void {
    const existing = this.sockets.get(userId) ?? new Set<WebSocket>()
    existing.add(socket)
    this.sockets.set(userId, existing)
  }

  unregister (userId: ID, socket: WebSocket): void {
    const sockets = this.sockets.get(userId)
    if (!sockets) return
    sockets.delete(socket)
    if (sockets.size === 0) this.sockets.delete(userId)
  }

  push (userId: ID, notification: Notification): void {
    const sockets = this.sockets.get(userId)
    if (!sockets || sockets.size === 0) return

    const payload = JSON.stringify({ notification })
    for (const socket of sockets) {
      if (socket.readyState === socket.OPEN) socket.send(payload)
    }
  }
}

// Shared across the process — the WS route registers connections into this exact instance,
// and SendNotificationUseCase defaults to pushing through it.
export const notificationSocketHub = new NotificationSocketHub()
