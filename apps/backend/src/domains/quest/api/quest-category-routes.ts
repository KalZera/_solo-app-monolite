import type { FastifyPluginAsync } from 'fastify'
import { ListQuestCategoriesUseCase } from '../application/list-quest-categories'
import { PrismaQuestCategoryRepository } from '../infrastructure/prisma-quest-category-repository'
import '../../../infrastructure/jwt/types.js'

export const questCategoryRoutes: FastifyPluginAsync = async (app) => {
  const repository = new PrismaQuestCategoryRepository(app.prisma)

  app.get('/', { preHandler: [app.authenticate] }, async () => {
    const listQuestCategories = new ListQuestCategoriesUseCase(repository)
    return listQuestCategories.execute()
  })
}
