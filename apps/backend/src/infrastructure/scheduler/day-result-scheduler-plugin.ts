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
import { EXECUTION_TIMEZONE, resolveExecutionDay } from '../../shared/utils/execution-timezone'

// Runs every day at 23:50 GMT-3 — right before the local day rolls over, so the day's quest
// completions are settled when we classify each character's day.
const CHECK_DAY_RESULT_CRON_EXPRESSION = '50 23 * * *'

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
        // Resolve the day being closed in GMT-3; the persisted record stays UTC (date-only).
        const date = resolveExecutionDay()
        const characters = await characterRepository.findAll()
        for (const character of characters) {
          const status = await checkDayResult.execute({ characterId: character.id, date })
          const dayResult = await registerDayResult.execute({ characterId: character.id, status, date })
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
    { timezone: EXECUTION_TIMEZONE }
  )

  app.addHook('onClose', async () => {
    await task.stop()
  })
})

export { dayResultSchedulerPlugin }
