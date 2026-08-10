import type { FastifyPluginAsync } from 'fastify'
import { GetDashboardSummaryUseCase } from '../application/get-dashboard-summary'
import { GetProgressionUseCase } from '../../progression/application/get-progression'
import { PrismaCharacterRepository } from '../../character/infrastructure/prisma-character-repository'
import { PrismaCharacterRestPointRepository } from '../../character/infrastructure/prisma-character-rest-point-repository'
import { PrismaQuestRepository } from '../../quest/infrastructure/prisma-quest-repository'
import { PrismaQuestInstanceRepository } from '../../quest/infrastructure/prisma-quest-instance-repository'
import '../../../infrastructure/jwt/types.js'

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  const characterRepository = new PrismaCharacterRepository(app.prisma)
  const restPointRepository = new PrismaCharacterRestPointRepository(app.prisma)
  const questRepository = new PrismaQuestRepository(app.prisma)
  const questInstanceRepository = new PrismaQuestInstanceRepository(app.prisma)

  app.get('/summary', { preHandler: [app.authenticate] }, async (req) => {
    const getProgression = new GetProgressionUseCase(characterRepository, restPointRepository)
    const getDashboardSummary = new GetDashboardSummaryUseCase(
      characterRepository,
      questRepository,
      questInstanceRepository,
      getProgression
    )
    return getDashboardSummary.execute({ userId: req.user.sub })
  })
}
