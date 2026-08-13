import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { RegisterUserUseCase } from '../application/register-user'
import { ConflictError } from '../../../shared/errors/app-error'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma'
import { verifyPassword } from '../../../shared/security/password'
import { InMemoryNotificationRepository } from '../../notification/infrastructure/in-memory-notification.repository'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../notification/domain/notification'

describe('RegisterUserUseCase', () => {
  let prisma: InMemoryPrisma
  let notificationRepository: InMemoryNotificationRepository

  beforeEach(() => {
    prisma = new InMemoryPrisma()
    notificationRepository = new InMemoryNotificationRepository()
  })

  it('registers a new user and returns selected public fields', async () => {
    const useCase = new RegisterUserUseCase(prisma as unknown as PrismaClient, notificationRepository)

    const result = await useCase.execute({
      email: 'hunter@solo.com',
      username: 'jinwoo',
      password: 'strong-password',
    })

    expect(result.id).toBeDefined()
    expect(result.email).toBe('hunter@solo.com')
    expect(result.username).toBe('jinwoo')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result).not.toHaveProperty('passwordHash')

    const storedUser = await prisma.user.findUnique({ where: { email: 'hunter@solo.com' } })
    expect(storedUser?.passwordHash).not.toBe('strong-password')
    expect(await verifyPassword('strong-password', storedUser!.passwordHash)).toBe(true)
  })

  it('creates default notification preferences for the new user', async () => {
    const saveSpy = vi.spyOn(notificationRepository, 'savePreferences')
    const useCase = new RegisterUserUseCase(prisma as unknown as PrismaClient, notificationRepository)

    const result = await useCase.execute({
      email: 'hunter@solo.com',
      username: 'jinwoo',
      password: 'strong-password',
    })

    expect(saveSpy).toHaveBeenCalledWith(result.id, DEFAULT_NOTIFICATION_PREFERENCES)
    expect(await notificationRepository.getPreferences(result.id)).toEqual(DEFAULT_NOTIFICATION_PREFERENCES)
  })

  it('throws ConflictError when email is already taken', async () => {
    prisma.seed({ email: 'taken@solo.com', username: 'existing', passwordHash: 'hash' })
    const useCase = new RegisterUserUseCase(prisma as unknown as PrismaClient, notificationRepository)

    await expect(
      useCase.execute({ email: 'taken@solo.com', username: 'newuser', password: 'password' })
    ).rejects.toThrow(ConflictError)
  })

  it('throws ConflictError when username is already taken', async () => {
    prisma.seed({ email: 'other@solo.com', username: 'taken', passwordHash: 'hash' })
    const useCase = new RegisterUserUseCase(prisma as unknown as PrismaClient, notificationRepository)

    await expect(useCase.execute({ email: 'new@solo.com', username: 'taken', password: 'password' })).rejects.toThrow(
      ConflictError
    )
  })
})
