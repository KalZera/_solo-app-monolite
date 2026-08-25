import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import cron from 'node-cron'
import { CheckDayResultUseCase } from '../../domains/progression/application/consistency/check-day-result'
import { RegisterDayResultUseCase } from '../../domains/progression/application/consistency/register-day-result'
import { PrismaCharacterRepository } from '../../domains/character/infrastructure/prisma-character-repository'
import { PrismaQuestRepository } from '../../domains/quest/infrastructure/prisma-quest-repository'
import { PrismaQuestInstanceRepository } from '../../domains/quest/infrastructure/prisma-quest-instance-repository'
import { PrismaProgressionStreakRepository } from '../../domains/progression/infrastructure/consistency/prisma-progression-streak-repository'
import { PrismaDayResultRepository } from '../../domains/progression/infrastructure/consistency/prisma-day-result-repository'

// Runs every day at 23:50 — right before the day rolls over, so the day's quest completions
// are settled when we classify each character's day.
const CHECK_DAY_RESULT_CRON_EXPRESSION = '50 23 * * *'

// Business rule (business_rules.md): quest deadlines are UTC. Pin the schedule explicitly
// rather than relying on the host process's implicit local timezone.
const QUEST_TIMEZONE = 'UTC'

const dayResultSchedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  const characterRepository = new PrismaCharacterRepository(app.prisma)
  const checkDayResult = new CheckDayResultUseCase(
    new PrismaQuestRepository(app.prisma),
    new PrismaQuestInstanceRepository(app.prisma)
  )
  const registerDayResult = new RegisterDayResultUseCase(
    new PrismaProgressionStreakRepository(app.prisma),
    new PrismaDayResultRepository(app.prisma)
  )

  const task = cron.schedule(
    CHECK_DAY_RESULT_CRON_EXPRESSION,
    async () => {
      try {
        app.log.info('Running day-result check job...')
        const characters = await characterRepository.findAll()
        for (const character of characters) {
          const status = await checkDayResult.execute({ characterId: character.id })
          const dayResult = await registerDayResult.execute({ characterId: character.id, status })
          app.log.info(
            {
              characterId: character.id,
              status,
              streakAfter: dayResult.streakAfter,
              freezeAfter: dayResult.freezeAfter,
            },
            'Day result registered'
          )
        }
      } catch (error) {
        app.log.error({ error }, 'Failed to run day-result check job')
      }
    },
    { timezone: QUEST_TIMEZONE }
  )

  app.addHook('onClose', async () => {
    await task.stop()
  })
})

export { dayResultSchedulerPlugin }
