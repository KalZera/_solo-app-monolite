import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import { identityRoutes } from './domains/identity/api/routes'
import { characterRoutes } from './domains/character/api/routes'
import { questRoutes } from './domains/quest/api/routes'
import { questCategoryRoutes } from './domains/quest/api/quest-category-routes'
// import { progressionRoutes } from './domains/progression/api/routes'
// import { rewardRoutes } from './domains/reward/api/routes'
// import { notificationRoutes } from './domains/notification/api/routes'
import { prismaPlugin } from './infrastructure/prisma/plugin'
import { jwtPlugin } from './infrastructure/jwt/plugin'
import { eventStorePlugin } from './infrastructure/events/event-store-plugin'
import { loggerConfig } from './infrastructure/logger/config'

export function buildApp() {
  const app = Fastify({ logger: loggerConfig })

  app.register(helmet)
  app.register(cors, { origin: true, credentials: true })
  app.register(cookie)

  app.register(prismaPlugin)
  app.register(jwtPlugin)
  app.register(eventStorePlugin)

  app.register(identityRoutes, { prefix: '/api/v1/identity' })
  app.register(characterRoutes, { prefix: '/api/v1/characters' })
  app.register(questRoutes, { prefix: '/api/v1/quests' })
  app.register(questCategoryRoutes, { prefix: '/api/v1/quest-categories' })
  // app.register(progressionRoutes, { prefix: '/api/v1/progression' })
  // app.register(rewardRoutes, { prefix: '/api/v1/rewards' })
  // app.register(notificationRoutes, { prefix: '/api/v1/notifications' })

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
