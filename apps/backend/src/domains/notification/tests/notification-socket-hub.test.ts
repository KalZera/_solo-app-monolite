import { describe, it, expect, vi } from 'vitest'
import type { WebSocket } from 'ws'
import { NotificationSocketHub } from '../infrastructure/websocket/notification-socket-hub'
import type { Notification } from '../domain/notification'

function buildSocket (readyState = 1 /* OPEN */): WebSocket {
  return { readyState, OPEN: 1, send: vi.fn() } as unknown as WebSocket
}

function buildNotification (overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notification-1',
    userId: 'user-1',
    type: 'QUEST_EXPIRED',
    channel: 'PUSH',
    title: 'Quest expired',
    message: 'Your quest has expired.',
    read: false,
    metadata: null,
    createdAt: new Date(),
    ...overrides,
  }
}

describe('NotificationSocketHub', () => {
  it('pushes the notification to every open socket registered for the user', () => {
    const hub = new NotificationSocketHub()
    const socketA = buildSocket()
    const socketB = buildSocket()
    hub.register('user-1', socketA)
    hub.register('user-1', socketB)

    const notification = buildNotification()
    hub.push('user-1', notification)

    const expectedPayload = JSON.stringify({ notification })
    expect(socketA.send).toHaveBeenCalledWith(expectedPayload)
    expect(socketB.send).toHaveBeenCalledWith(expectedPayload)
  })

  it('does not push to a socket that has since closed', () => {
    const hub = new NotificationSocketHub()
    const closedSocket = buildSocket(3 /* CLOSED */)
    hub.register('user-1', closedSocket)

    hub.push('user-1', buildNotification())

    expect(closedSocket.send).not.toHaveBeenCalled()
  })

  it('never pushes to a different user', () => {
    const hub = new NotificationSocketHub()
    const socket = buildSocket()
    hub.register('user-1', socket)

    hub.push('user-2', buildNotification({ userId: 'user-2' }))

    expect(socket.send).not.toHaveBeenCalled()
  })

  it('stops delivering to a socket once it is unregistered', () => {
    const hub = new NotificationSocketHub()
    const socket = buildSocket()
    hub.register('user-1', socket)
    hub.unregister('user-1', socket)

    hub.push('user-1', buildNotification())

    expect(socket.send).not.toHaveBeenCalled()
  })

  it('does nothing when the user has no registered sockets', () => {
    const hub = new NotificationSocketHub()
    expect(() => hub.push('ghost-user', buildNotification({ userId: 'ghost-user' }))).not.toThrow()
  })
})
