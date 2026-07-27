import type { FastifyPluginAsync } from 'fastify'
import { CreateCharacterUseCase } from '../application/create-character'
import { GetCharacterProfileUseCase } from '../application/get-character-profile'
import { UpdateCharacterUseCase } from '../application/update-character'
import { DeleteCharacterUseCase } from '../application/delete-character'
import { AllocateAttributePointUseCase } from '../application/allocate-attribute-point'
import { PrismaCharacterRepository } from '../infrastructure/prisma-character-repository'
import { PrismaCharacterRestPointRepository } from '../infrastructure/prisma-character-rest-point-repository'
import '../../../infrastructure/jwt/types.js'

export const characterRoutes: FastifyPluginAsync = async (app) => {
  const repository = new PrismaCharacterRepository(app.prisma)
  const restPointRepository = new PrismaCharacterRestPointRepository(app.prisma)

  app.get('/', { preHandler: [app.authenticate] }, async (req) => {
    const getCharacterProfile = new GetCharacterProfileUseCase(repository, restPointRepository)
    return getCharacterProfile.execute({ userId: req.user.sub })
  })

  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const createCharacter = new CreateCharacterUseCase(repository, restPointRepository)
    const result = await createCharacter.execute({
      ...(req.body as Omit<Parameters<typeof createCharacter.execute>[0], 'userId'>),
      userId: req.user.sub,
    })
    return reply.status(201).send(result)
  })

  app.patch('/', { preHandler: [app.authenticate] }, async (req) => {
    const updateCharacter = new UpdateCharacterUseCase(repository)
    return updateCharacter.execute({
      ...(req.body as Omit<Parameters<typeof updateCharacter.execute>[0], 'userId'>),
      userId: req.user.sub,
    })
  })

  app.delete('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const deleteCharacter = new DeleteCharacterUseCase(repository)
    await deleteCharacter.execute({ userId: req.user.sub })
    return reply.status(204).send()
  })

  app.post('/attributes/allocate', { preHandler: [app.authenticate] }, async (req) => {
    const allocateAttributePoint = new AllocateAttributePointUseCase(repository, restPointRepository)
    return allocateAttributePoint.execute({
      ...(req.body as Omit<Parameters<typeof allocateAttributePoint.execute>[0], 'userId'>),
      userId: req.user.sub,
    })
  })
}
