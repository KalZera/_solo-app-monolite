import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import { identityRoutes } from './domains/identity/api/routes'
import { characterRoutes } from './domains/character/api/routes'
import { questRoutes } from './domains/quest/api/routes'
import { questCategoryRoutes } from './domains/quest/api/quest-category-routes'
import { dashboardRoutes } from './domains/dashboard/api/routes'
// import { progressionRoutes } from './domains/progression/api/routes'
// import { rewardRoutes } from './domains/reward/api/routes'
// import { notificationRoutes } from './domains/notification/api/routes'
import { prismaPlugin } from './infrastructure/prisma/plugin'
import { jwtPlugin } from './infrastructure/jwt/plugin'
import { eventStorePlugin } from './infrastructure/events/event-store-plugin'
import { characterHistoryPlugin } from './infrastructure/events/character-history-plugin'
import { questExpirationSchedulerPlugin } from './infrastructure/scheduler/quest-expiration-scheduler-plugin'
import { loggerConfig } from './infrastructure/logger/config'
import { errorHandler } from './infrastructure/http/error-handler'

export function buildApp () {
  const app = Fastify({ logger: loggerConfig })

  app.register(helmet)
  app.register(cors, { origin: true, credentials: true })
  app.register(cookie)
  app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })

  app.register(prismaPlugin)
  app.register(jwtPlugin)
  app.register(eventStorePlugin)
  app.register(characterHistoryPlugin)
  app.register(questExpirationSchedulerPlugin)

  app.setErrorHandler(errorHandler)

  app.register(identityRoutes, { prefix: '/api/v1/identity' })
  app.register(characterRoutes, { prefix: '/api/v1/characters' })
  app.register(questRoutes, { prefix: '/api/v1/quests' })
  app.register(questCategoryRoutes, { prefix: '/api/v1/quest-categories' })
  app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })
  // app.register(progressionRoutes, { prefix: '/api/v1/progression' })
  // app.register(rewardRoutes, { prefix: '/api/v1/rewards' })
  // app.register(notificationRoutes, { prefix: '/api/v1/notifications' })

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
