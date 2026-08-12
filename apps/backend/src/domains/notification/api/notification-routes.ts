import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { PrismaPushSubscriptionRepository } from '../infrastructure/push/prisma-push-subscription.repository'
import { parseInput } from '../../../infrastructure/http/validate'
import { pushSubscriptionBodySchema } from './notification.schemas'
import '../../../infrastructure/jwt/types.js'

const deletePushSubscriptionQuerySchema = z.object({ endpoint: z.string().min(1) })

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  const pushSubscriptionRepository = new PrismaPushSubscriptionRepository(app.prisma)

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
}
