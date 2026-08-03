import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { Prisma } from '@prisma/client'
import { AppError } from '../../shared/errors/app-error'

interface MappedError {
  status: number
  code: string
  message: string
}

// Translates known Prisma error codes into safe, client-friendly responses so
// database internals (constraint names, SQL) never leak to the client.
function mapPrismaError (error: Prisma.PrismaClientKnownRequestError): MappedError | null {
  switch (error.code) {
    case 'P2002': // unique constraint violation
      return { status: 409, code: 'CONFLICT', message: 'Resource already exists' }
    case 'P2003': // foreign key constraint violation
      return { status: 409, code: 'CONFLICT', message: 'Operation violates a related resource constraint' }
    case 'P2025': // record required but not found
      return { status: 404, code: 'NOT_FOUND', message: 'Resource not found' }
    default:
      return null
  }
}

export function errorHandler (error: FastifyError, _req: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.code, message: error.message })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(error)
    if (mapped) {
      return reply.status(mapped.status).send({ error: mapped.code, message: mapped.message })
    }
  }

  if (error.validation) {
    return reply.status(400).send({ error: 'VALIDATION_ERROR', message: error.message })
  }

  // Unknown/unexpected error: log the detail server-side, expose nothing sensitive.
  reply.log.error(error)
  return reply.status(500).send({ error: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' })
}
