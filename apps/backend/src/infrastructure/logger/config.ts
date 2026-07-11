import type { FastifyServerOptions } from 'fastify'

const isDev = process.env.NODE_ENV !== 'production'

export const loggerConfig: FastifyServerOptions['logger'] = isDev
  ? { level: 'debug', transport: { target: 'pino-pretty', options: { colorize: true } } }
  : { level: 'info' }
