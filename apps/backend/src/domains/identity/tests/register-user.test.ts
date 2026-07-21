import { describe, it, expect, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { RegisterUserUseCase } from '../application/register-user.js'
import { ConflictError } from '../../../shared/errors/app-error.js'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma.js'

describe('RegisterUserUseCase', () => {
  let prisma: InMemoryPrisma

  beforeEach(() => {
    prisma = new InMemoryPrisma()
  })

  it('registers a new user and returns selected public fields', async () => {
    const useCase = new RegisterUserUseCase(prisma as unknown as PrismaClient)

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
  })

  it('throws ConflictError when email is already taken', async () => {
    prisma.seed({ email: 'taken@solo.com', username: 'existing', passwordHash: 'hash' })
    const useCase = new RegisterUserUseCase(prisma as unknown as PrismaClient)

    await expect(
      useCase.execute({ email: 'taken@solo.com', username: 'newuser', password: 'password' }),
    ).rejects.toThrow(ConflictError)
  })

  it('throws ConflictError when username is already taken', async () => {
    prisma.seed({ email: 'other@solo.com', username: 'taken', passwordHash: 'hash' })
    const useCase = new RegisterUserUseCase(prisma as unknown as PrismaClient)

    await expect(
      useCase.execute({ email: 'new@solo.com', username: 'taken', password: 'password' }),
    ).rejects.toThrow(ConflictError)
  })
})
