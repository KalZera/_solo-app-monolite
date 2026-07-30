import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import cron from 'node-cron'
import { ExpireQuestsUseCase } from '../../domains/quest/application/expire-quests'
import { PrismaQuestRepository } from '../../domains/quest/infrastructure/prisma-quest-repository'

// Runs at 00:00 and 12:00 every day — i.e. every 12 hours.
const EXPIRE_QUESTS_CRON_EXPRESSION = '0 */12 * * *'

const questExpirationSchedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  const expireQuests = new ExpireQuestsUseCase(new PrismaQuestRepository(app.prisma))

  const task = cron.schedule(EXPIRE_QUESTS_CRON_EXPRESSION, async () => {
    try {
      const failedQuests = await expireQuests.execute()
      if (failedQuests.length > 0) {
        app.log.info({ count: failedQuests.length }, 'Expired quests marked as failed')
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
