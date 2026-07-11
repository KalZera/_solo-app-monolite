import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../../shared/errors/app-error.js'

const plugin: FastifyPluginAsync = async (app) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET env variable is required')
  }

  app.register(fastifyJwt, { secret })

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      throw new UnauthorizedError('Invalid or expired token')
    }
  })
}

export const jwtPlugin = fp(plugin, { name: 'jwt' })
