import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { PrismaPushSubscriptionRepository } from '../infrastructure/push/prisma-push-subscription.repository'
import { PrismaNotificationRepository } from '../infrastructure/prisma-notification.repository'
import { GetNotificationPreferencesUseCase } from '../application/get-notification-preferences'
import { UpdateNotificationPreferencesUseCase } from '../application/update-notification-preferences'
import { parseInput } from '../../../infrastructure/http/validate'
import { pushSubscriptionBodySchema, updateNotificationPreferencesBodySchema } from './notification.schemas'
import '../../../infrastructure/jwt/types.js'

const deletePushSubscriptionQuerySchema = z.object({ endpoint: z.string().min(1) })

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  const pushSubscriptionRepository = new PrismaPushSubscriptionRepository(app.prisma)
  const notificationRepository = new PrismaNotificationRepository(app.prisma)

  // Called by the client once it has a browser PushSubscription (see
  // web-push-subscription.ts on the frontend). Upsert-by-endpoint — re-subscribing (e.g.
  // after clearing site data) just refreshes the keys for the same row.
  app.post('/push-subscriptions', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = parseInput(pushSubscriptionBodySchema, req.body)
    const subscription = await pushSubscriptionRepository.save({
      userId: req.user.sub,
      endpoint: body.endpoint,
      keys: body.keys,
    })
    return reply.status(201).send(subscription)
  })

  app.delete('/push-subscriptions', { preHandler: [app.authenticate] }, async (req, reply) => {
    const query = parseInput(deletePushSubscriptionQuerySchema, req.query)
    await pushSubscriptionRepository.deleteByEndpoint(query.endpoint)
    return reply.status(204).send()
  })

  app.get('/preferences', { preHandler: [app.authenticate] }, async (req) => {
    const getNotificationPreferences = new GetNotificationPreferencesUseCase(notificationRepository)
    return getNotificationPreferences.execute({ userId: req.user.sub })
  })

  app.put('/preferences', { preHandler: [app.authenticate] }, async (req) => {
    const body = parseInput(updateNotificationPreferencesBodySchema, req.body)
    const updateNotificationPreferences = new UpdateNotificationPreferencesUseCase(notificationRepository)
    return updateNotificationPreferences.execute({ userId: req.user.sub, preferences: body })
  })
}
