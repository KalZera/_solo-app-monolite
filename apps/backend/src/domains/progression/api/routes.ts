import type { FastifyPluginAsync } from 'fastify'
import { GetProgressionUseCase } from '../application/get-progression'
import { GetStreakUseCase } from '../application/consistency/get-streak'
import { PrismaCharacterRepository } from '../../character/infrastructure/prisma-character-repository'
import { PrismaCharacterRestPointRepository } from '../../character/infrastructure/prisma-character-rest-point-repository'

import '../../../infrastructure/jwt/types.js'
import {PrismaProgressionStreakRepository} from '../infrastructure/consistency/prisma-progression-streak-repository'

export const progressionRoutes: FastifyPluginAsync = async (app) => {
  const characterRepository = new PrismaCharacterRepository(app.prisma)
  const characterRestPointsRepository = new PrismaCharacterRestPointRepository(app.prisma)
  const progressionStreakRepository = new PrismaProgressionStreakRepository(app.prisma)


  app.get('/character/:characterId', async (req) => {
    const { characterId } = req.params as { characterId: string }
    return { characterId, level: 1, experience: 0, nextLevelXp: 100 }
  })

  app.post('/character/:characterId/xp', async (req) => {
    const { characterId } = req.params as { characterId: string }
    const { amount } = req.body as { amount: number }
    return { characterId, gained: amount, newTotal: amount }
  })

  app.get('/character/progression', { preHandler: [app.authenticate] }, async (req) => {
    const getProgression = new GetProgressionUseCase(characterRepository,characterRestPointsRepository)
    return getProgression.execute({ userId: req.user.sub })
  })

  app.get('/character/streak', { preHandler: [app.authenticate] }, async (req) => {
    const getStreak = new GetStreakUseCase(characterRepository, progressionStreakRepository)
    return getStreak.execute({ userId: req.user.sub })
  })
  
}
