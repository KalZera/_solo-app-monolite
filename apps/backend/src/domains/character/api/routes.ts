import type { FastifyPluginAsync } from 'fastify'
import { CreateCharacterUseCase } from '../application/create-character'
import { GetCharacterProfileUseCase } from '../application/get-character-profile'
import { UpdateCharacterUseCase } from '../application/update-character'
import { DeleteCharacterUseCase } from '../application/delete-character'
import { AllocateAttributePointUseCase } from '../application/allocate-attribute-point'
import { GetCharacterHistoryUseCase } from '../application/get-character-history'
import { UploadCharacterAvatarUseCase } from '../application/upload-character-avatar'
import { PrismaCharacterRepository } from '../infrastructure/prisma-character-repository'
import { PrismaCharacterRestPointRepository } from '../infrastructure/prisma-character-rest-point-repository'
import { PrismaCharacterHistoryRepository } from '../infrastructure/prisma-character-history-repository'
import { R2AvatarStorage } from '../../../infrastructure/storage/r2-avatar-storage'
import { ValidationError } from '../../../shared/errors/app-error'
import '../../../infrastructure/jwt/types.js'

export const characterRoutes: FastifyPluginAsync = async (app) => {
  const repository = new PrismaCharacterRepository(app.prisma)
  const restPointRepository = new PrismaCharacterRestPointRepository(app.prisma)
  const historyRepository = new PrismaCharacterHistoryRepository(app.prisma)

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

  app.get('/history', { preHandler: [app.authenticate] }, async (req) => {
    const { page, pageSize } = req.query as { page?: string; pageSize?: string }
    const getCharacterHistory = new GetCharacterHistoryUseCase(repository, historyRepository)
    return getCharacterHistory.execute({
      userId: req.user.sub,
      ...(page !== undefined && { page: Number(page) }),
      ...(pageSize !== undefined && { pageSize: Number(pageSize) }),
    })
  })

  app.post('/avatar', { preHandler: [app.authenticate] }, async (req) => {
    const file = await req.file()

    if (!file) {
      throw new ValidationError('No avatar file uploaded')
    }

    const fileBuffer = await file.toBuffer()
    const uploadCharacterAvatar = new UploadCharacterAvatarUseCase(repository, new R2AvatarStorage())
    return uploadCharacterAvatar.execute({
      userId: req.user.sub,
      fileBuffer,
      mimeType: file.mimetype,
    })
  })
}
