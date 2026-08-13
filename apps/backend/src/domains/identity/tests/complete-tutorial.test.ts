import { describe, it, expect, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { CompleteTutorialUseCase } from '../application/complete-tutorial'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma'
import { hashPassword } from '../../../shared/security/password'

const USER_ID = randomUUID()

describe('CompleteTutorialUseCase', () => {
  let prisma: InMemoryPrisma

  beforeEach(async () => {
    prisma = new InMemoryPrisma()
    prisma.seed({
      id: USER_ID,
      email: 'jinwoo@solo.com',
      username: 'jinwoo',
      passwordHash: await hashPassword('current-password'),
    })
  })

  it('defaults isCompleteTutorial to false for a freshly seeded Hunter', async () => {
    const user = await prisma.user.findUnique({ where: { id: USER_ID } })
    expect(user?.isCompleteTutorial).toBe(false)
  })

  it('marks the tutorial as complete and returns the flag without the password hash', async () => {
    const useCase = new CompleteTutorialUseCase(prisma as unknown as PrismaClient)

    const result = await useCase.execute({ userId: USER_ID, isCompleteTutorial: true })

    expect(result.isCompleteTutorial).toBe(true)
    expect(result).not.toHaveProperty('passwordHash')

    const persisted = await prisma.user.findUnique({ where: { id: USER_ID } })
    expect(persisted?.isCompleteTutorial).toBe(true)
  })

  it('can flip the flag back to false (re-show the tutorial)', async () => {
    const useCase = new CompleteTutorialUseCase(prisma as unknown as PrismaClient)

    await useCase.execute({ userId: USER_ID, isCompleteTutorial: true })
    const result = await useCase.execute({ userId: USER_ID, isCompleteTutorial: false })

    expect(result.isCompleteTutorial).toBe(false)
  })

  it('throws NotFoundError when the user does not exist', async () => {
    const useCase = new CompleteTutorialUseCase(prisma as unknown as PrismaClient)

    await expect(
      useCase.execute({ userId: randomUUID(), isCompleteTutorial: true })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
