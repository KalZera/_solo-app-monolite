import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { eventBus } from '../../shared/events/domain-event'
import type { DomainEvent } from '../../shared/events/domain-event'

const eventStorePlugin: FastifyPluginAsync = fp(async (app) => {
  eventBus.subscribeToAll(async (event: DomainEvent) => {
    await app.prisma.event.create({
      data: {
        eventName: event.eventType,
        eventPayload: JSON.parse(JSON.stringify(event)),
      },
    })
  })
})

export { eventStorePlugin }
