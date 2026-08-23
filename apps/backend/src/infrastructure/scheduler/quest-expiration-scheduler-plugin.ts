import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import cron from 'node-cron'
import { ExpireQuestsUseCase } from '../../domains/quest/application/expire-quests'
import { PrismaQuestInstanceRepository } from '../../domains/quest/infrastructure/prisma-quest-instance-repository'

// Runs every 2 hours (00:00, 06:00, 12:00, …).
// const EXPIRE_QUESTS_CRON_EXPRESSION = '*/2 * * * *'
const EXPIRE_QUESTS_CRON_EXPRESSION = '0 */6 * * *'

// A 2h-cadence maintenance job has no need for sub-second precision. node-cron's default
// missedExecutionTolerance is 1000ms, which is too tight for any real Node process (a brief
// GC pause or a concurrent request burst is enough to trip it) and logs a scary-looking but
// harmless "missed execution... blocking IO or high CPU" warning. A few minutes of slack
// costs nothing here and only a genuinely stuck/frozen process would still exceed it.
const MISSED_EXECUTION_TOLERANCE_MS = 5 * 60 * 1000

// Business rule (business_rules.md): quest deadlines are UTC. Pin the schedule explicitly
// rather than relying on the host process's implicit local timezone.
const QUEST_TIMEZONE = 'UTC'

const questExpirationSchedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  const expireQuests = new ExpireQuestsUseCase(
    new PrismaQuestInstanceRepository(app.prisma)
  )

  const task = cron.schedule(
    EXPIRE_QUESTS_CRON_EXPRESSION,
    async () => {
      try {
        const failedInstances = await expireQuests.execute()
        if (failedInstances.length > 0) {
          app.log.info({ count: failedInstances.length }, 'Overdue quest instances marked FAILED')
        }
      } catch (error) {
        app.log.error({ error }, 'Failed to run quest expiration job')
      }
    },
    { timezone: QUEST_TIMEZONE, missedExecutionTolerance: MISSED_EXECUTION_TOLERANCE_MS }
  )

  app.addHook('onClose', async () => {
    await task.stop()
  })
})

export { questExpirationSchedulerPlugin }
