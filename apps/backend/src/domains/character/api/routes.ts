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
import { parseInput } from '../../../infrastructure/http/validate'
import {
  allocateAttributeBodySchema,
  characterHistoryQuerySchema,
  createCharacterBodySchema,
  updateCharacterBodySchema,
} from './character.schemas'
import '../../../infrastructure/jwt/types.js'
import { GetProgressionUseCase } from '../../progression/application/get-progression'

export const characterRoutes: FastifyPluginAsync = async (app) => {
  const repository = new PrismaCharacterRepository(app.prisma)
  const restPointRepository = new PrismaCharacterRestPointRepository(app.prisma)
  const historyRepository = new PrismaCharacterHistoryRepository(app.prisma)

  app.get('/', { preHandler: [app.authenticate] }, async (req) => {
    const getProgressioh = new GetProgressionUseCase(repository)
    const getCharacterProfile = new GetCharacterProfileUseCase(repository, restPointRepository, getProgressioh)
    return getCharacterProfile.execute({ userId: req.user.sub })
  })

  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = parseInput(createCharacterBodySchema, req.body)
    const createCharacter = new CreateCharacterUseCase(repository, restPointRepository)
    const result = await createCharacter.execute({ ...body, userId: req.user.sub })
    return reply.status(201).send(result)
  })

  app.patch('/', { preHandler: [app.authenticate] }, async (req) => {
    const body = parseInput(updateCharacterBodySchema, req.body)
    const updateCharacter = new UpdateCharacterUseCase(repository)
    return updateCharacter.execute({ ...body, userId: req.user.sub })
  })

  app.delete('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const deleteCharacter = new DeleteCharacterUseCase(repository)
    await deleteCharacter.execute({ userId: req.user.sub })
    return reply.status(204).send()
  })

  app.post('/attributes/allocate', { preHandler: [app.authenticate] }, async (req) => {
    const body = parseInput(allocateAttributeBodySchema, req.body)
    const allocateAttributePoint = new AllocateAttributePointUseCase(repository, restPointRepository)
    return allocateAttributePoint.execute({ ...body, userId: req.user.sub })
  })

  app.get('/history', { preHandler: [app.authenticate] }, async (req) => {
    const query = parseInput(characterHistoryQuerySchema, req.query)
    const getCharacterHistory = new GetCharacterHistoryUseCase(repository, historyRepository)
    return getCharacterHistory.execute({ userId: req.user.sub, ...query })
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
