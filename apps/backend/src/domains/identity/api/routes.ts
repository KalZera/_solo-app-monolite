import type { FastifyPluginAsync, FastifyReply } from 'fastify'
import { RegisterUserUseCase } from '../application/register-user'
import { LoginUserUseCase } from '../application/login-user'
import { RefreshSessionUseCase } from '../application/refresh-session'
import { UpdateUserUseCase } from '../application/update-user'
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_TTL,
  REFRESH_TOKEN_TTL_SECONDS,
} from '../../../infrastructure/jwt/constants'
import type { TokenPayload } from '../../../infrastructure/jwt/token-payload'
import '../.././../infrastructure/jwt/types.js'

function setRefreshCookie(reply: FastifyReply, token: string) {
  const isProduction = process.env.NODE_ENV === 'production'

  reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/v1/identity',
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  })
}

export const identityRoutes: FastifyPluginAsync = async (app) => {
  const registerUser = new RegisterUserUseCase(app.prisma)

  const signAccessToken = (payload: TokenPayload) =>
    app.jwt.sign({ ...payload, type: 'access' }, { expiresIn: ACCESS_TOKEN_TTL })
  const signRefreshToken = (payload: TokenPayload) =>
    app.jwt.sign({ ...payload, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_TTL })

  app.post('/register', async (req, reply) => {
    const result = await registerUser.execute(req.body as Parameters<typeof registerUser.execute>[0])
    return reply.status(201).send(result)
  })

  app.post('/login', async (req, reply) => {
    const loginUser = new LoginUserUseCase(app.prisma, signAccessToken, signRefreshToken)
    const { access_token, refresh_token } = await loginUser.execute(req.body as Parameters<typeof loginUser.execute>[0])
    setRefreshCookie(reply, refresh_token)
    return reply.send({ access_token })
  })

  app.post('/refresh', async (req, reply) => {
    const refreshSession = new RefreshSessionUseCase(
      app.prisma,
      (token) => app.jwt.verify<TokenPayload & { type: string }>(token),
      signAccessToken,
      signRefreshToken,
    )
    const { access_token, refresh_token } = await refreshSession.execute(req.cookies[REFRESH_TOKEN_COOKIE_NAME])
    setRefreshCookie(reply, refresh_token)
    return reply.send({ access_token })
  })

  app.post('/logout', async (_req, reply) => {
    reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/api/v1/identity' })
    return reply.status(204).send()
  })

  app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.send(req.user)
  })

  app.patch('/password', async (req, reply) => {
    const updateUser = new UpdateUserUseCase(app.prisma)
    const result = await updateUser.execute(req.body as Parameters<typeof updateUser.execute>[0])
    return reply.send(result)
  })
}
