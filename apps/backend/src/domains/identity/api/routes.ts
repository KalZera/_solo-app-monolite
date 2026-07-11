import type { FastifyPluginAsync } from 'fastify'
import { RegisterUserUseCase } from '../application/register-user.js'
import { LoginUserUseCase } from '../application/login-user.js'
import '../.././../infrastructure/jwt/types.js'

export const identityRoutes: FastifyPluginAsync = async (app) => {
  const registerUser = new RegisterUserUseCase(app.prisma)

  app.post('/register', async (req, reply) => {
    const result = await registerUser.execute(req.body as Parameters<typeof registerUser.execute>[0])
    return reply.status(201).send(result)
  })

  app.post('/login', async (req, reply) => {
    const loginUser = new LoginUserUseCase(
      app.prisma,
      (payload) => app.jwt.sign(payload, { expiresIn: '7d' }),
    )
    const result = await loginUser.execute(req.body as Parameters<typeof loginUser.execute>[0])
    return reply.send(result)
  })

  app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.send(req.user)
  })
}
