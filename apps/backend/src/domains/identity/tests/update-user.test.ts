import { describe, it, expect, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { UpdateUserUseCase } from '../application/update-user'
import { NotFoundError, UnauthorizedError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma'
import { hashPassword, verifyPassword } from '../../../shared/security/password'

const USER_ID = randomUUID()
const USER_EMAIL = 'jinwoo@solo.com'
const CURRENT_PASSWORD = 'current-password'
const NEW_PASSWORD = 'new-password'

describe('UpdateUserUseCase', () => {
  let prisma: InMemoryPrisma

  beforeEach(async () => {
    prisma = new InMemoryPrisma()
    prisma.seed({
      id: USER_ID,
      email: USER_EMAIL,
      username: 'jinwoo',
      passwordHash: await hashPassword(CURRENT_PASSWORD),
    })
  })

  it('hashes and persists the new password when the current password is valid', async () => {
    const useCase = new UpdateUserUseCase(prisma as unknown as PrismaClient)

    const result = await useCase.execute({
      userId: USER_ID,
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    })

    expect(result.id).toBe(USER_ID)
    expect(result).not.toHaveProperty('passwordHash')

    const updatedUser = await prisma.user.findUnique({ where: { id: USER_ID } })
    expect(updatedUser?.passwordHash).not.toBe(CURRENT_PASSWORD)
    expect(updatedUser?.passwordHash).not.toBe(NEW_PASSWORD)
    expect(await verifyPassword(NEW_PASSWORD, updatedUser!.passwordHash)).toBe(true)
  })

  it('throws UnauthorizedError when the current password is incorrect', async () => {
    const useCase = new UpdateUserUseCase(prisma as unknown as PrismaClient)

    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: 'wrong-password', newPassword: NEW_PASSWORD })
    ).rejects.toThrow(UnauthorizedError)

    // The stored password must remain unchanged after a failed attempt.
    const user = await prisma.user.findUnique({ where: { id: USER_ID } })
    expect(await verifyPassword(CURRENT_PASSWORD, user!.passwordHash)).toBe(true)
  })

  it('throws NotFoundError when no user matches the id', async () => {
    const useCase = new UpdateUserUseCase(prisma as unknown as PrismaClient)

    await expect(
      useCase.execute({ userId: randomUUID(), currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD })
    ).rejects.toThrow(NotFoundError)
  })

  it('rejects a new password shorter than the minimum length', async () => {
    const useCase = new UpdateUserUseCase(prisma as unknown as PrismaClient)

    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: '123' })
    ).rejects.toThrow(ValidationError)
  })
})
