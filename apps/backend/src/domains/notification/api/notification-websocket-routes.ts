import type { FastifyPluginAsync } from 'fastify'
import { notificationSocketHub } from '../infrastructure/websocket/notification-socket-hub'
import type { TokenPayload } from '../../../infrastructure/jwt/token-payload'
import '../../../infrastructure/jwt/types'

interface NotificationSocketQuery {
  token?: string
}

// The browser WebSocket API can't set custom headers, so the access token travels as a
// query param on the upgrade request instead of the usual Authorization header.
export const notificationWebsocketRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: NotificationSocketQuery }>('/ws', { websocket: true }, (socket, request) => {
    const { token } = request.query

    if (!token) {
      socket.close(4401, 'Missing token')
      return
    }

    let userId: string
    try {
      const payload = app.jwt.verify<TokenPayload & { type: 'access' | 'refresh' }>(token)
      if (payload.type !== 'access') throw new Error('Invalid token type')
      userId = payload.sub
    } catch {
      socket.close(4401, 'Invalid or expired token')
      return
    }

    notificationSocketHub.register(userId, socket)

    socket.on('close', () => {
      notificationSocketHub.unregister(userId, socket)
    })
  })
}
