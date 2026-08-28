import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import cron from 'node-cron'
import { CreateQuestInstanceUseCase } from '../../domains/quest/application/create-quest-instance'
import { PrismaQuestRepository } from '../../domains/quest/infrastructure/prisma-quest-repository'
import { PrismaQuestInstanceRepository } from '../../domains/quest/infrastructure/prisma-quest-instance-repository'
import { EXECUTION_TIMEZONE } from '../../shared/utils/execution-timezone'

// Runs every 30 minutes for dev.
const CREATE_QUEST_INSTANCE_CRON_EXPRESSION = '0 */4 * * *'

const questInstanceCreateSchedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  const createQuestInstance = new CreateQuestInstanceUseCase(
    new PrismaQuestRepository(app.prisma),
    new PrismaQuestInstanceRepository(app.prisma)
  )

  const task = cron.schedule(
    CREATE_QUEST_INSTANCE_CRON_EXPRESSION,
    async () => {
      try {
        console.log('================')
        console.log('Running quest instance creation job...')
        console.log('================')
        await createQuestInstance.execute()
      } catch (error) {
        app.log.error({ error }, 'Failed to run quest instance creation job')
      }
    },
    { timezone: EXECUTION_TIMEZONE }
  )

  app.addHook('onClose', async () => {
    await task.stop()
  })
})

export { questInstanceCreateSchedulerPlugin }
