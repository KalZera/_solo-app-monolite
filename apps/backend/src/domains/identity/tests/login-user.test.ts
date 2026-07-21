import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { LoginUserUseCase } from '../application/login-user'
import { UnauthorizedError } from '../../../shared/errors/app-error'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma'

const SEEDED_USER = {
  email: 'jinwoo@solo.com',
  username: 'jinwoo',
  passwordHash: 'correct-hash',
}

describe('LoginUserUseCase', () => {
  let prisma: InMemoryPrisma
  let sign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    prisma = new InMemoryPrisma()
    sign = vi.fn().mockReturnValue('fake-jwt-token')
  })

  it('returns access_token for valid credentials', async () => {
    prisma.seed(SEEDED_USER)
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, sign)

    const result = await useCase.execute({
      email: SEEDED_USER.email,
      password: SEEDED_USER.passwordHash,
    })

    expect(result).toEqual({ access_token: 'fake-jwt-token' })
    expect(sign).toHaveBeenCalledWith({
      sub: expect.any(String),
      email: SEEDED_USER.email,
      username: SEEDED_USER.username,
    })
  })

  it('throws UnauthorizedError when the user does not exist', async () => {
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, sign)

    await expect(
      useCase.execute({ email: 'ghost@solo.com', password: 'any-password' }),
    ).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError when the password is wrong', async () => {
    prisma.seed(SEEDED_USER)
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, sign)

    await expect(
      useCase.execute({ email: SEEDED_USER.email, password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedError)
  })

  it('propagates errors thrown by the sign function', async () => {
    prisma.seed(SEEDED_USER)
    sign.mockImplementation(() => { throw new Error('jwt signing failed') })
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, sign)

    await expect(
      useCase.execute({ email: SEEDED_USER.email, password: SEEDED_USER.passwordHash }),
    ).rejects.toThrow('jwt signing failed')
  })
})
