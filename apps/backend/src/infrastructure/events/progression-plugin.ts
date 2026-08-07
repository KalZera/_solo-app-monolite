import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { eventBus } from '../../shared/events/domain-event'
import { PrismaProgressionRepository } from '../../domains/progression/infrastructure/prisma-progression-repository'
import { ApplyLevelUpUseCase } from '../../domains/progression/application/apply-level-up'
import type { LevelUpEvent } from '../../domains/progression/events/level-up.event'

// Reacts to 'LevelUp' by actually applying it: new level, +1 attributes, power score
// and rest points (ApplyLevelUpUseCase). GrantExperienceUseCase only detects the
// crossing and publishes the event — this is where the level-up takes effect.
const progressionPlugin: FastifyPluginAsync = fp(async (app) => {
  const progressionRepository = new PrismaProgressionRepository(app.prisma)
  const applyLevelUp = new ApplyLevelUpUseCase(progressionRepository)

  eventBus.subscribe<LevelUpEvent>('LevelUp', async (event) => {
    await applyLevelUp.execute({ characterId: event.characterId, newLevel: event.newLevel })
  })
})

export { progressionPlugin }
