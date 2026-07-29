import { describe, it, expect, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { UpdateUserUseCase } from '../application/update-user'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma'
import { hashPassword, verifyPassword } from '../../../shared/security/password'

const USER_ID = randomUUID()
const USER_EMAIL = 'jinwoo@solo.com'
const CURRENT_PASSWORD = 'current-password'

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

  it('hashes and persists the new password for the user matching the email', async () => {
    const useCase = new UpdateUserUseCase(prisma as unknown as PrismaClient)

    const result = await useCase.execute({
      email: USER_EMAIL,
      newPassword: 'new-password',
    })

    expect(result.id).toBe(USER_ID)
    expect(result).not.toHaveProperty('passwordHash')

    const updatedUser = await prisma.user.findUnique({ where: { id: USER_ID } })
    expect(updatedUser?.passwordHash).not.toBe(CURRENT_PASSWORD)
    expect(updatedUser?.passwordHash).not.toBe('new-password')
    expect(await verifyPassword('new-password', updatedUser!.passwordHash)).toBe(true)
  })

  it('throws NotFoundError when no user matches the email', async () => {
    const useCase = new UpdateUserUseCase(prisma as unknown as PrismaClient)

    await expect(useCase.execute({ email: 'ghost@solo.com', newPassword: 'new-password' })).rejects.toThrow(
      NotFoundError
    )
  })
})
