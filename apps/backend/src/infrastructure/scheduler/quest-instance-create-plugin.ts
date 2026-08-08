import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import cron from 'node-cron'
import { CreateQuestInstanceUseCase } from '../../domains/quest/application/create-quest-instance'
import { PrismaQuestRepository } from '../../domains/quest/infrastructure/prisma-quest-repository'
import { PrismaQuestInstanceRepository } from '../../domains/quest/infrastructure/prisma-quest-instance-repository'

// Runs every 30 minutes for dev.
const CREATE_QUEST_INSTANCE_CRON_EXPRESSION = '*/30 * * * *'

// Business rule (business_rules.md): quest deadlines are GMT-3. Pin the schedule explicitly
// rather than relying on the host process's implicit local timezone.
const QUEST_TIMEZONE = 'America/Sao_Paulo'

const questInstanceCreateSchedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  const createQuestInstance = new CreateQuestInstanceUseCase(
    new PrismaQuestRepository(app.prisma),
    new PrismaQuestInstanceRepository(app.prisma)
  )

  const task = cron.schedule(
    CREATE_QUEST_INSTANCE_CRON_EXPRESSION,
    async () => {
      try {
        console.log('Running quest instance creation job...')
        await createQuestInstance.execute()
      } catch (error) {
        app.log.error({ error }, 'Failed to run quest instance creation job')
      }
    },
    { timezone: QUEST_TIMEZONE }
  )

  app.addHook('onClose', async () => {
    await task.stop()
  })
})

export { questInstanceCreateSchedulerPlugin }
