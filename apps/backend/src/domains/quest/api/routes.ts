import type { FastifyPluginAsync } from 'fastify'
import { CreateQuestUseCase } from '../application/create-quest'
import { ListQuestsUseCase } from '../application/list-quests'
import { GetQuestUseCase } from '../application/get-quest'
import { CreateQuestInstanceUseCase } from '../application/create-quest-instance'
import { UpdateQuestUseCase } from '../application/update-quest'
import { DeleteQuestUseCase } from '../application/delete-quest'
import { StartQuestUseCase } from '../application/start-quest'
import { UpdateQuestProgressUseCase } from '../application/update-quest-progress'
import { CompleteQuestUseCase } from '../application/complete-quest'
import { FailQuestUseCase } from '../application/fail-quest'
import { PrismaQuestRepository } from '../infrastructure/prisma-quest-repository'
import { PrismaQuestInstanceRepository } from '../infrastructure/prisma-quest-instance-repository'
import { PrismaCharacterRepository } from '../../character/infrastructure/prisma-character-repository'
import { PrismaProgressionRepository } from '../../progression/infrastructure/prisma-progression-repository'
import { GrantExperienceUseCase } from '../../progression/application/grant-experience'
import { parseInput } from '../../../infrastructure/http/validate'
import {
  createQuestBodySchema,
  questIdParamsSchema,
  questInstanceIdParamsSchema,
  todayQuestsQuerySchema,
  updateProgressBodySchema,
  updateQuestBodySchema,
} from './quest.schemas'
import '../../../infrastructure/jwt/types.js'

export const questRoutes: FastifyPluginAsync = async (app) => {
  const questRepository = new PrismaQuestRepository(app.prisma)
  const questInstanceRepository = new PrismaQuestInstanceRepository(app.prisma)
  const characterRepository = new PrismaCharacterRepository(app.prisma)
  const progressionRepository = new PrismaProgressionRepository(app.prisma)

  // ─── Templates ─────────────────────────────────────────────────────────────
  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = parseInput(createQuestBodySchema, req.body)
    const createQuest = new CreateQuestUseCase(questRepository, characterRepository, questInstanceRepository)
    const result = await createQuest.execute({ ...body, userId: req.user.sub })
    return reply.status(201).send(result)
  })

  app.get('/', { preHandler: [app.authenticate] }, async (req) => {
    const listQuests = new ListQuestsUseCase(questRepository, characterRepository)
    return listQuests.execute({ userId: req.user.sub })
  })
//have to use the id of instance to get all details of quest 
  app.get('/:id', { preHandler: [app.authenticate] }, async (req) => {
    const { id } = req.params as { id: string }
    const getQuest = new GetQuestUseCase(questInstanceRepository, characterRepository)
    return getQuest.execute({ userId: req.user.sub, questInstanceId: id })
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

  // ─── Instances (executions) ─────────────────────────────────────────────────\
  // isso vai virar uma cron job que vai rodar todo dia e criar as quests do dia, então não precisa de rota pra isso
  // somente se rodar manualmente 
  app.get('/today', { preHandler: [app.authenticate] }, async (req) => {
    const { status, tab } = parseInput(todayQuestsQuerySchema, req.query)
    const createQuestInstance = new CreateQuestInstanceUseCase(questRepository, questInstanceRepository)
    return createQuestInstance.execute({ userId: req.user.sub, activeOnly: status === 'active'})
  })

  app.post('/instances/:instanceId/start', { preHandler: [app.authenticate] }, async (req) => {
    const { instanceId } = parseInput(questInstanceIdParamsSchema, req.params)
    const startQuest = new StartQuestUseCase(questInstanceRepository, questRepository, characterRepository)
    return startQuest.execute({ userId: req.user.sub, questInstanceId: instanceId })
  })

  app.post('/instances/:instanceId/progress', { preHandler: [app.authenticate] }, async (req) => {
    const { instanceId } = parseInput(questInstanceIdParamsSchema, req.params)
    const body = parseInput(updateProgressBodySchema, req.body)
    const updateProgress = new UpdateQuestProgressUseCase(questInstanceRepository, questRepository, characterRepository)
    return updateProgress.execute({ userId: req.user.sub, questInstanceId: instanceId, ...body })
  })

  app.post('/instances/:instanceId/complete', { preHandler: [app.authenticate] }, async (req) => {
    const { instanceId } = parseInput(questInstanceIdParamsSchema, req.params)
    const grantExperience = new GrantExperienceUseCase(characterRepository, progressionRepository)
    const completeQuest = new CompleteQuestUseCase(
      questInstanceRepository,
      questRepository,
      characterRepository,
      grantExperience
    )
    return completeQuest.execute({ userId: req.user.sub, questInstanceId: instanceId })
  })

  app.post('/instances/:instanceId/fail', { preHandler: [app.authenticate] }, async (req) => {
    const { instanceId } = parseInput(questInstanceIdParamsSchema, req.params)
    const failQuest = new FailQuestUseCase(questInstanceRepository, questRepository, characterRepository)
    return failQuest.execute({ userId: req.user.sub, questInstanceId: instanceId })
  })
}
