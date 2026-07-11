import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { identityRoutes } from './domains/identity/api/routes.js'
import { characterRoutes } from './domains/character/api/routes.js'
// import { questRoutes } from './domains/quest/api/routes.js'
// import { progressionRoutes } from './domains/progression/api/routes.js'
// import { rewardRoutes } from './domains/reward/api/routes.js'
// import { notificationRoutes } from './domains/notification/api/routes.js'
import { prismaPlugin } from './infrastructure/prisma/plugin.js'
import { jwtPlugin } from './infrastructure/jwt/plugin.js'
import { loggerConfig } from './infrastructure/logger/config.js'

export function buildApp() {
  const app = Fastify({ logger: loggerConfig })

  app.register(helmet)
  app.register(cors, { origin: true })

  app.register(prismaPlugin)
  app.register(jwtPlugin)

  app.register(identityRoutes, { prefix: '/api/v1/identity' })
  app.register(characterRoutes, { prefix: '/api/v1/characters' })
  // app.register(questRoutes, { prefix: '/api/v1/quests' })
  // app.register(progressionRoutes, { prefix: '/api/v1/progression' })
  // app.register(rewardRoutes, { prefix: '/api/v1/rewards' })
  // app.register(notificationRoutes, { prefix: '/api/v1/notifications' })

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
