import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import cron from 'node-cron'
import { DeactivateExpiredQuestsUseCase } from '../../domains/quest/application/deactivate-expired-quests'
import { PrismaQuestRepository } from '../../domains/quest/infrastructure/prisma-quest-repository'

// Runs every 12 hours (00:00, 12:00).
const DEACTIVATE_EXPIRED_QUESTS_CRON_EXPRESSION = '0 */12 * * *'
// const DEACTIVATE_EXPIRED_QUESTS_CRON_EXPRESSION = '*/2 * * * *'

// A 6h-cadence maintenance job has no need for sub-second precision — see the identical
// rationale in quest-expiration-scheduler-plugin.
const MISSED_EXECUTION_TOLERANCE_MS = 5 * 60 * 1000

// Business rule (business_rules.md): quest deadlines are UTC. Pin the schedule explicitly
// rather than relying on the host process's implicit local timezone.
const QUEST_TIMEZONE = 'UTC'

const questDeactivationSchedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  const deactivateExpiredQuests = new DeactivateExpiredQuestsUseCase(new PrismaQuestRepository(app.prisma))

  const task = cron.schedule(
    DEACTIVATE_EXPIRED_QUESTS_CRON_EXPRESSION,
    async () => {
      try {
        const deactivated = await deactivateExpiredQuests.execute()
        if (deactivated.length > 0) {
          app.log.info({ count: deactivated.length }, 'Quest templates past their deadlineDate deactivated')
        }
      } catch (error) {
        app.log.error({ error }, 'Failed to run quest deactivation job')
      }
    },
    { timezone: QUEST_TIMEZONE, missedExecutionTolerance: MISSED_EXECUTION_TOLERANCE_MS }
  )

  app.addHook('onClose', async () => {
    await task.stop()
  })
})

export { questDeactivationSchedulerPlugin }
