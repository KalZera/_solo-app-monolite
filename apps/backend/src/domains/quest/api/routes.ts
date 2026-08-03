import type { FastifyPluginAsync } from 'fastify'
import type { QuestFilter, QuestView } from '../domain/quest'
import { CreateQuestUseCase } from '../application/create-quest'
import { ListQuestsUseCase } from '../application/list-quests'
import { GetQuestUseCase } from '../application/get-quest'
import { UpdateQuestUseCase } from '../application/update-quest'
import { DeleteQuestUseCase } from '../application/delete-quest'
import { CompleteQuestUseCase } from '../application/complete-quest'
import { CompleteQuestObjectiveUseCase } from '../application/complete-quest-objective'
import { PrismaQuestRepository } from '../infrastructure/prisma-quest-repository'
import { PrismaCharacterRepository } from '../../character/infrastructure/prisma-character-repository'
import { PrismaProgressionRepository } from '../../progression/infrastructure/prisma-progression-repository'
import { GrantExperienceUseCase } from '../../progression/use-cases/grant-experience'
import { parseInput } from '../../../infrastructure/http/validate'
import {
  createQuestBodySchema,
  listQuestsQuerySchema,
  questIdParamsSchema,
  questObjectiveParamsSchema,
  updateQuestBodySchema,
} from './quest.schemas'
import '../../../infrastructure/jwt/types.js'

export const questRoutes: FastifyPluginAsync = async (app) => {
  const questRepository = new PrismaQuestRepository(app.prisma)
  const characterRepository = new PrismaCharacterRepository(app.prisma)
  const progressionRepository = new PrismaProgressionRepository(app.prisma)

  app.get('/', { preHandler: [app.authenticate] }, async (req) => {
    const { view, ...filter } = (req.query ?? {}) as QuestFilter & { view?: QuestView }
    // Validate the view enum (rejects unknown values with 400). The remaining filter is read-only.
    parseInput(listQuestsQuerySchema, { view })
    const listQuests = new ListQuestsUseCase(questRepository, characterRepository)
    return listQuests.execute({
      userId: req.user.sub,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      view,
    })
  })

  app.get('/:id', { preHandler: [app.authenticate] }, async (req) => {
    const { id } = parseInput(questIdParamsSchema, req.params)
    const getQuest = new GetQuestUseCase(questRepository, characterRepository)
    return getQuest.execute({ userId: req.user.sub, questId: id })
  })

  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = parseInput(createQuestBodySchema, req.body)
    const createQuest = new CreateQuestUseCase(questRepository, characterRepository)
    const result = await createQuest.execute({ ...body, userId: req.user.sub })
    return reply.status(201).send(result)
  })

  app.patch('/:id', { preHandler: [app.authenticate] }, async (req) => {
    const { id } = parseInput(questIdParamsSchema, req.params)
    const body = parseInput(updateQuestBodySchema, req.body)
    const updateQuest = new UpdateQuestUseCase(questRepository, characterRepository)
    return updateQuest.execute({ ...body, userId: req.user.sub, questId: id })
  })

  app.delete('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = parseInput(questIdParamsSchema, req.params)
    const deleteQuest = new DeleteQuestUseCase(questRepository, characterRepository)
    await deleteQuest.execute({ userId: req.user.sub, questId: id })
    return reply.status(204).send()
  })

  app.post('/:id/complete', { preHandler: [app.authenticate] }, async (req) => {
    const { id } = parseInput(questIdParamsSchema, req.params)
    const grantExperience = new GrantExperienceUseCase(progressionRepository)
    const completeQuest = new CompleteQuestUseCase(questRepository, characterRepository, grantExperience)
    return completeQuest.execute({ userId: req.user.sub, questId: id })
  })

  app.post('/:id/objectives/:objectiveId/complete', { preHandler: [app.authenticate] }, async (req) => {
    const { id, objectiveId } = parseInput(questObjectiveParamsSchema, req.params)
    const completeQuestObjective = new CompleteQuestObjectiveUseCase(questRepository, characterRepository)
    return completeQuestObjective.execute({ userId: req.user.sub, questId: id, objectiveId })
  })
}
