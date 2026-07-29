import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../../shared/errors/app-error'

export function errorHandler (error: FastifyError, _req: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.code, message: error.message })
  }

  if (error.validation) {
    return reply.status(400).send({ error: 'VALIDATION_ERROR', message: error.message })
  }

  reply.log.error(error)
  return reply.status(500).send({ error: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' })
}
