import '@fastify/jwt'
import type { TokenPayload } from './token-payload'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload & { type: 'access' | 'refresh' }
    user: TokenPayload & { type: 'access' | 'refresh' }
  }
}
