import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import cron from 'node-cron'
import { ExpireQuestsUseCase } from '../../domains/quest/application/expire-quests'
import { PrismaQuestRepository } from '../../domains/quest/infrastructure/prisma-quest-repository'
import { PrismaQuestInstanceRepository } from '../../domains/quest/infrastructure/prisma-quest-instance-repository'

// Runs every 2 hours (00:00, 02:00, 04:00, …).
const EXPIRE_QUESTS_CRON_EXPRESSION = '0 */2 * * *'

const questExpirationSchedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  const expireQuests = new ExpireQuestsUseCase(
    new PrismaQuestInstanceRepository(app.prisma),
    new PrismaQuestRepository(app.prisma)
  )

  const task = cron.schedule(EXPIRE_QUESTS_CRON_EXPRESSION, async () => {
    try {
      const failedInstances = await expireQuests.execute()
      if (failedInstances.length > 0) {
        app.log.info({ count: failedInstances.length }, 'Overdue quest instances marked FAILED')
      }
    } catch (error) {
      app.log.error({ error }, 'Failed to run quest expiration job')
    }
  })

  app.addHook('onClose', async () => {
    await task.stop()
  })
})

export { questExpirationSchedulerPlugin }
